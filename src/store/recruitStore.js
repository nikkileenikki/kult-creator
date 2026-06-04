import { create } from 'zustand'
import { fetchRecruits, updateRecruitStatus as apiUpdateStatus } from '../lib/api/recruits'
import { useCreatorStore } from './creatorStore'

export const useRecruitStore = create((set, get) => ({
  requests: [],
  loading:  false,
  error:    null,

  fetchRecruits: async () => {
    set({ loading: true, error: null })
    try {
      const requests = await fetchRecruits()
      set({ requests, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  pendingCount: () =>
    get().requests.filter(r => r.status === 'Pending' || r.status === 'Under Review').length,

  updateStatus: async (id, status, extra = {}) => {
    const { pic, rejectionReason } = extra
    const recruit = get().requests.find(r => r.id === id)
    set(state => ({
      requests: state.requests.map(r => r.id === id
        ? { ...r, status, ...(pic ? { pic } : {}), ...(rejectionReason ? { rejectionReason } : {}) }
        : r
      ),
    }))
    await apiUpdateStatus(id, { status, pic, rejectionReason })

    if ((status === 'Approved' || status === 'Rejected') && recruit) {
      const creatorStore = useCreatorStore.getState()
      const exists = creatorStore.creators.some(c => c.id === `c_r_${id}`)
      if (!exists) {
        const effectivePic = pic || (recruit.pic !== 'Unassigned' ? recruit.pic : '')
        const newCreator = {
          id:             `c_r_${id}`,
          initials:       recruit.initials,
          name:           recruit.name,
          platform:       recruit.platform,
          niche:          recruit.niche,
          secondaryNiche: '',
          followers:      recruit.followers,
          coins:          0,
          tasksCompleted: 0,
          status:         status === 'Approved' ? 'Active' : 'Rejected',
          pic:            effectivePic,
          contact:        'WhatsApp',
          joinedDate:     new Date().toISOString().split('T')[0],
          avatarColor:    recruit.avatarColor,
          persona: {
            contentStyle: '', toneOfVoice: '', brandFitTags: [],
            audienceAgeRange: '', audienceGender: '', audienceLocations: '',
            engagementStyle: '', pastCollabs: [], dos: [], donts: [], internalNotes: '',
            ...(status === 'Rejected' && rejectionReason ? { rejectionReason } : {}),
          },
        }
        useCreatorStore.setState(s => ({ creators: [...s.creators, newCreator] }))
      }
    }
  },
}))
