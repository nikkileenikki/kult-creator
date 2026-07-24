import { useState, useEffect, useMemo } from 'react'
import { useCreatorStore } from '@/store/creatorStore'
import { useUIStore } from '@/store/uiStore'
import { Mail, FileDown, Pencil, Archive, ArchiveRestore } from 'lucide-react'
import Avatar from '@/components/shared/Avatar'
import AgreementModal from '@/components/modals/AgreementModal'
import { downloadAgreementDocx } from '@/lib/agreementDoc'
import { buildAgreementDefaults } from '@/lib/agreementDefaults'
import { fetchAgreementSheets, createAgreementSheet, updateAgreementSheet } from '@/lib/api/agreementSheets'

const TAB_BTN = 'px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all'

export default function AgreementSheets() {
  const creators     = useCreatorStore(s => s.creators)
  const globalSearch = useUIStore(s => s.globalSearch)
  const showToast    = useUIStore(s => s.showToast)

  const [sheets, setSheets]   = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('all') // 'all' | 'archived'
  const [editTarget, setEditTarget] = useState(null)
  const [busyId, setBusyId]   = useState(null)

  async function loadSheets() {
    setLoading(true)
    try { setSheets(await fetchAgreementSheets()) }
    catch (e) { showToast('Failed to load agreement sheets: ' + e.message, 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadSheets() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const sheetByCreator = useMemo(() => {
    const map = new Map()
    for (const s of sheets) map.set(s.creatorId, s)
    return map
  }, [sheets])

  const rows = useMemo(() => {
    const q = globalSearch?.toLowerCase()
    return creators
      .map(c => ({ creator: c, sheet: sheetByCreator.get(c.id) ?? null }))
      .filter(({ creator }) => !q || creator.name.toLowerCase().includes(q) || creator.email?.toLowerCase().includes(q))
      .filter(({ sheet }) => tab === 'archived' ? sheet?.archived : !sheet?.archived)
  }, [creators, sheetByCreator, tab, globalSearch])

  const archivedCount = sheets.filter(s => s.archived).length

  async function handleDownload(creator, sheet) {
    setBusyId(creator.id)
    try {
      const hasData = sheet && Object.keys(sheet.data || {}).length > 0
      const data = hasData ? sheet.data : buildAgreementDefaults({ name: creator.name, email: creator.email, phone: creator.contactNumber })
      const filename = `Agreement-${creator.name.replace(/[^\w\-]+/g, '_')}-${new Date().toISOString().slice(0, 10)}.docx`
      await downloadAgreementDocx(filename, data)
      if (!hasData) {
        if (sheet) await updateAgreementSheet(sheet.id, { data })
        else await createAgreementSheet({ creatorId: creator.id, data })
        await loadSheets()
      }
    } catch (e) {
      showToast('Failed to generate document: ' + e.message, 'error')
    } finally {
      setBusyId(null)
    }
  }

  async function handleToggleArchive(creator, sheet) {
    setBusyId(creator.id)
    try {
      if (sheet) {
        await updateAgreementSheet(sheet.id, { archived: !sheet.archived })
      } else {
        await createAgreementSheet({ creatorId: creator.id, data: {}, archived: true })
      }
      showToast(sheet?.archived ? 'Restored' : 'Archived')
      await loadSheets()
    } catch (e) {
      showToast('Failed to update: ' + e.message, 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="animate-[fadeUp_.3s_ease]">
      <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">Agreement Sheets</h1>
          <p className="text-[12px] text-white/30 mt-1">Generate the ASTRO DocuSign & Stamping Information Sheet for any creator</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTab('all')} className={`${TAB_BTN} ${tab === 'all' ? 'bg-violet-500/20 border-violet-500/40 text-violet-300' : 'bg-white/5 border-white/7 text-white/50 hover:border-white/20'}`}>
            All
          </button>
          <button onClick={() => setTab('archived')} className={`${TAB_BTN} ${tab === 'archived' ? 'bg-violet-500/20 border-violet-500/40 text-violet-300' : 'bg-white/5 border-white/7 text-white/50 hover:border-white/20'}`}>
            Archived {archivedCount > 0 && `(${archivedCount})`}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-[13px] text-white/25 italic py-12 text-center">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-[13px] text-white/25 italic py-12 text-center">
          {tab === 'archived' ? 'No archived entries.' : 'No creators yet.'}
        </div>
      ) : (
        <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden">
          <div className="divide-y divide-white/[0.05]">
            {rows.map(({ creator, sheet }) => (
              <div key={creator.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[.02] transition-colors">
                <Avatar initials={creator.initials} color={creator.avatarColor} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-white truncate">{creator.name}</div>
                  {creator.email && (
                    <div className="flex items-center gap-1.5 text-[12px] text-white/40 truncate">
                      <Mail size={11} className="text-white/20 flex-shrink-0" />
                      {creator.email}
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-white/25 flex-shrink-0 hidden sm:block">
                  {sheet && !sheet.archived ? `Generated ${new Date(sheet.updatedAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}` : sheet?.archived ? 'Archived' : 'Not generated yet'}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleDownload(creator, sheet)}
                    disabled={busyId === creator.id}
                    title="Download"
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all disabled:opacity-40"
                  >
                    <FileDown size={13} />
                  </button>
                  <button
                    onClick={() => setEditTarget({ creator, sheet })}
                    title="Edit"
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleToggleArchive(creator, sheet)}
                    disabled={busyId === creator.id}
                    title={sheet?.archived ? 'Restore' : 'Archive'}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/15 flex items-center justify-center text-white/40 hover:text-rose-400 transition-all disabled:opacity-40"
                  >
                    {sheet?.archived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editTarget && (
        <AgreementModal
          creatorId={editTarget.creator.id}
          creatorName={editTarget.creator.name}
          creatorEmail={editTarget.creator.email}
          creatorPhone={editTarget.creator.contactNumber}
          recordId={editTarget.sheet?.id}
          initialData={editTarget.sheet?.data}
          onClose={() => setEditTarget(null)}
          onSaved={loadSheets}
        />
      )}
    </div>
  )
}
