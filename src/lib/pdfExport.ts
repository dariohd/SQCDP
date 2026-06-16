import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Action, Axe, Comment, DayState, StateLabels } from '../types'
import { formatMonthLabel } from './utils'
import { getCurrentEquipe } from './team'

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
