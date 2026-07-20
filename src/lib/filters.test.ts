import { describe, expect, it } from 'vitest'
import { filterActionsForEquipe } from './filters'
import type { Action } from '../types'

function action(partial: Partial<Action>): Action {
  return {
    id: 1,
    axe_id: 1,
    probleme: 'x',
    porteur: 'x',
    statut: 'ouverte',
    ...partial,
  } as Action
}

describe('filterActionsForEquipe', () => {
  it('keeps shared actions and matching equipe', () => {
    const list = [
      action({ id: 1, probleme: 'a', equipe: 'Ligne 1' }),
      action({ id: 2, probleme: 'b', equipe: 'Ligne 2' }),
      action({ id: 3, probleme: 'c' }),
    ]
    expect(filterActionsForEquipe(list, 'Ligne 1').map((a) => a.id)).toEqual([1, 3])
  })
})
