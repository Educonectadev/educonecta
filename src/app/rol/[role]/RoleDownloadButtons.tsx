export default function RoleDownloadButtons({ role }: { role: string }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <a
        href={`/api/download/public/${role}?platform=win`}
        download
        className="sa-btn sa-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l7.5.7v6.8H4z"/><path d="M4 20l7.5-.7v-6.8H4z"/><path d="M12.5 3.5L20 4v7h-7.5z"/><path d="M12.5 20.5L20 20v-7h-7.5z"/></svg>
        Windows
      </a>
      <a
        href={`/api/download/public/${role}?platform=linux`}
        download
        className="sa-btn sa-btn-outline inline-flex items-center gap-2 px-5 py-2.5 text-xs"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L9 7m3-4l3 4m-3-4v4M6 11l3-1m-3 1l-3 4m3-4h12m0 0l3 4m-3-4l-3-1"/><path d="M6 11l3 5h6l3-5"/><path d="M12 16v2"/></svg>
        Linux
      </a>
      <a
        href={`/api/download/public/${role}?platform=mac`}
        download
        className="sa-btn sa-btn-outline inline-flex items-center gap-2 px-5 py-2.5 text-xs"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>
        macOS
      </a>
    </div>
  )
}
