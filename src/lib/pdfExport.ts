import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Action, Axe, Comment, DayState, StateLabels } from '../types'
import { formatMonthLabel } from './utils'
import { getCurrentEquipe } from './team'

import type { DailyReportData } from './dailyReport'
import { ROULETTE_ROLES } from './constants'

export function exportDailyPDF(data: DailyReportData) {
  const doc = new jsPDF()
  const equipe = data.equipe

  doc.setFontSize(22)
  doc.setTextColor(58, 85, 164)
  doc.text('SQCDP — Compte-rendu Daily', 14, 22)

  doc.setFontSize(11)
  doc.setTextColor(80, 80, 80)
  doc.text(`Date : ${data.date}`, 14, 32)
  doc.text(`Équipe : ${equipe}`, 14, 38)
  doc.text(
    `Durée réunion : ${Math.floor(data.timerSec / 60)} min ${data.timerSec % 60} s`,
    14,
    44,
  )
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 50)

  let y = 58

  if (Object.keys(data.rouletteResults).length > 0) {
    doc.setFontSize(13)
    doc.setTextColor(58, 85, 164)
    doc.text('Attribution des rôles', 14, y)
    y += 8
    doc.setFontSize(10)
    doc.setTextColor(60, 60, 60)
    ROULETTE_ROLES.forEach((r) => {
      doc.text(`${r.label} : ${data.rouletteResults[r.id] ?? '—'}`, 18, y)
      y += 6
    })
    y += 4
  }

  doc.setFontSize(13)
  doc.setTextColor(58, 85, 164)
  doc.text('États du jour', 14, y)
  y += 8

  autoTable(doc, {
    startY: y,
    head: [['Axe', 'Libellé', 'État']],
    body: data.todayStates.map(({ axe, etat }) => [axe.key, axe.label, etat]),
    theme: 'striped',
    headStyles: { fillColor: [58, 85, 164] },
    styles: { fontSize: 9 },
  })

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

  if (data.notifications.length > 0) {
    doc.setFontSize(13)
    doc.setTextColor(236, 83, 83)
    doc.text('Alertes', 14, y)
    y += 6
    autoTable(doc, {
      startY: y,
      head: [['Niveau', 'Titre', 'Message']],
      body: data.notifications.slice(0, 8).map((n) => [n.level, n.title, n.message]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [236, 83, 83] },
    })
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
  }

  if (data.openActions.length > 0) {
    doc.setFontSize(13)
    doc.setTextColor(58, 85, 164)
    doc.text('Actions ouvertes', 14, y)
    autoTable(doc, {
      startY: y + 4,
      head: [['Problème', 'Porteur', 'Échéance']],
      body: data.openActions.slice(0, 12).map((a) => [
        a.probleme,
        a.porteur,
        a.echeance ?? '—',
      ]),
      styles: { fontSize: 8 },
    })
  }

  const done = data.checklist.filter((c) => c.done)
  if (done.length > 0) {
    doc.addPage()
    doc.setFontSize(13)
    doc.setTextColor(58, 85, 164)
    doc.text('Points abordés (ordre du jour)', 14, 20)
    done.forEach((c, i) => {
      doc.setFontSize(10)
      doc.setTextColor(60, 60, 60)
      doc.text(`✓ ${c.label}`, 18, 30 + i * 7)
    })
  }

  doc.save(`Daily_SQCDP_${data.date}_${equipe.replace(/\s+/g, '_')}.pdf`)
}

export function exportMonthlyPDF(
  monthKey: string,
  axes: Axe[],
  dayStates: DayState[],
  actions: Action[],
  comments: Comment[],
  labels: StateLabels,
  statsPerAxe: { axe: Axe; vert: number; jaune: number; rouge: number; gris: number }[],
) {
  const doc = new jsPDF()
  const equipe = getCurrentEquipe()

  doc.setFontSize(20)
  doc.setTextColor(58, 85, 164)
  doc.text('SQCDP — Rapport mensuel', 14, 20)

  doc.setFontSize(11)
  doc.setTextColor(80, 80, 80)
  doc.text(`${formatMonthLabel(monthKey)} | Équipe: ${equipe}`, 14, 28)
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 34)

  autoTable(doc, {
    startY: 42,
    head: [['Axe', labels.vert, labels.jaune, labels.rouge, labels.gris, 'Total']],
    body: statsPerAxe.map((s) => {
      const t = s.vert + s.jaune + s.rouge + s.gris
      const pct = t ? Math.round((s.vert / t) * 100) : 0
      return [s.axe.label, String(s.vert), String(s.jaune), String(s.rouge), String(s.gris), `${pct}% OK`]
    }),
    theme: 'grid',
    headStyles: { fillColor: [58, 85, 164] },
  })

  const openActions = actions.filter((a) => a.statut === 'ouverte')
  if (openActions.length > 0) {
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY
    doc.setFontSize(14)
    doc.setTextColor(58, 85, 164)
    doc.text('Actions ouvertes', 14, finalY + 10)
    autoTable(doc, {
      startY: finalY + 14,
      head: [['Axe', 'Problème', 'Porteur', 'Échéance', 'Criticité']],
      body: openActions.map((a) => {
        const axe = axes.find((x) => x.id === a.axe_id)
        return [axe?.key ?? '', a.probleme, a.porteur, a.echeance ?? '—', a.criticite ?? '—']
      }),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [236, 83, 83] },
    })
  }

  doc.addPage()
  doc.setFontSize(14)
  doc.text('Synthèse par axe', 14, 20)
  axes.forEach((axe, i) => {
    const y = 30 + i * 38
    const axeStates = dayStates.filter((d) => Number(d.axe_id) === axe.id)
    const axeActions = actions.filter((a) => Number(a.axe_id) === axe.id)
    const axeComments = comments.filter((c) => Number(c.axe_id) === axe.id)
    doc.setFontSize(11)
    doc.setTextColor(58, 85, 164)
    doc.text(`${axe.key} — ${axe.label}`, 14, y)
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text(
      `${axeStates.length} états | ${axeActions.length} actions | ${axeComments.length} commentaires`,
      14,
      y + 6,
    )
    const s = statsPerAxe.find((x) => x.axe.id === axe.id)
    if (s) {
      doc.text(
        `${labels.vert}: ${s.vert}  ${labels.jaune}: ${s.jaune}  ${labels.rouge}: ${s.rouge}  ${labels.gris}: ${s.gris}`,
        14,
        y + 12,
      )
    }
  })

  doc.save(`SQCDP_${monthKey}_${equipe.replace(/\s+/g, '_')}.pdf`)
}
