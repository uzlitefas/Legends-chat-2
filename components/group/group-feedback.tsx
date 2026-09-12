import type { GroupEntry } from "@/type/group-type/grouptype"

export function GroupFeedback({ entry }: { entry: GroupEntry }) {
  return <>
    {(entry.loading || entry.saving) && <p role="status">Kutilmoqda...</p>}
    {entry.error && <p role="alert">{entry.error}</p>}
    {entry.settingsError && <p role="alert">Kirish sozlamalari: {entry.settingsError}</p>}
    {entry.message && <p role="status">{entry.message}</p>}
  </>
}
