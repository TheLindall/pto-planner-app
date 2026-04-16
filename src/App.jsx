import { useRef, useState, useEffect } from "react"
import { useStorage } from "@/hooks/useStorage"
import { SetupView } from "@/components/SetupView"
import { TimelineView } from "@/components/TimelineView"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Download, Upload, MoreVertical, Trash2, QrCode, Copy, Check } from "lucide-react"
import { PlaneAnimation } from "@/components/PlaneAnimation"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import LZString from "lz-string"
import { QRCodeSVG } from "qrcode.react"

const ROULETTE_WORDS = ["a coffee", "a beer", "an ice cream", "a cat", "a pizza", "a hot dog", "toilet paper", "chocolate", "spice", "fleeb juice", "a pair of socks", "Cheez-Its", "nerd clusters", "guac", "tacos"]

function RouletteWord() {
  const [index, setIndex] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const [cooling, setCooling] = useState(false)
  const timerRef = useRef(null)
  const coolRef = useRef(null)
  const spinningRef = useRef(false)

  function spin() {
    if (cooling || spinningRef.current) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIndex(Math.floor(Math.random() * ROULETTE_WORDS.length))
      setAnimKey(k => k + 1)
      return
    }
    spinningRef.current = true
    clearTimeout(timerRef.current)
    const target = Math.floor(Math.random() * ROULETTE_WORDS.length)
    let step = 0
    const steps = 20

    function tick() {
      step++
      const next = step < steps ? Math.floor(Math.random() * ROULETTE_WORDS.length) : target
      setIndex(next)
      setAnimKey(k => k + 1)
      if (step < steps) {
        const delay = 100 + Math.pow(step / steps, 2.5) * 500
        timerRef.current = setTimeout(tick, delay)
      } else {
        spinningRef.current = false
        setCooling(true)
        coolRef.current = setTimeout(() => setCooling(false), 2500)
      }
    }

    tick()
  }

  useEffect(() => {
    spin()
    return () => { spinningRef.current = false; clearTimeout(timerRef.current); clearTimeout(coolRef.current) }
  }, [])

  return (
    <span
      role="button"
      tabIndex={0}
      onMouseEnter={spin}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); spin() } }}
      aria-label="Spin for a random word"
      style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", cursor: "pointer" }}
    >
      <span
        key={animKey}
        style={{ display: "inline-block", animation: "slot-up 0.12s ease-out", fontWeight: 900 }}
      >
        {ROULETTE_WORDS[index]}
      </span>
    </span>
  )
}

const TABS = [
  { id: "setup", label: "Setup" },
  { id: "timeline", label: "Timeline" },
  { id: "about", label: "About" },
]

export default function App() {
  const [activeTab, setActiveTab] = useState("setup")
  const [moreOpen, setMoreOpen] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [qrUrl, setQrUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const { data, setPtoTypes, setEvents } = useStorage()
  const importRef = useRef(null)

  // On load, check if URL has ?data= and auto-import
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get("data")
    if (!encoded) return
    try {
      const json = LZString.decompressFromEncodedURIComponent(encoded)
      const parsed = JSON.parse(json)
      if (!parsed.ptoTypes || !parsed.events) throw new Error("Invalid")
      if (confirm("Import shared PTO data? This will replace your current data.")) {
        setPtoTypes(parsed.ptoTypes)
        setEvents(parsed.events)
      }
    } catch {
      // ignore malformed data
    } finally {
      // clean the URL
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  function handleExport() {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pto-planner-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMoreOpen(false)
  }

  function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        if (!parsed.ptoTypes || !parsed.events) throw new Error("Invalid file")
        if (!confirm("This will replace all current data. Continue?")) return
        setPtoTypes(parsed.ptoTypes)
        setEvents(parsed.events)
      } catch {
        alert("Invalid backup file.")
      } finally {
        e.target.value = ""
      }
    }
    reader.readAsText(file)
    setMoreOpen(false)
  }

  function handleReset() {
    setPtoTypes([])
    setEvents([])
    setResetConfirmOpen(false)
  }

  function handleShare() {
    const json = JSON.stringify(data)
    const encoded = LZString.compressToEncodedURIComponent(json)
    const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`
    setQrUrl(url)
    setQrOpen(true)
    setMoreOpen(false)
  }

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 text-primary">
            <PlaneAnimation activeTab={activeTab} />
            PTO Planner
          </h1>

          {/* Desktop actions — hidden on mobile */}
          <div className="hidden sm:flex gap-2 items-center">
            <Button variant="ghost" size="sm" onClick={handleExport}>
              <Download className="size-4" aria-hidden="true" />
              Backup
            </Button>
            <Button variant="ghost" size="sm" onClick={() => importRef.current?.click()}>
              <Upload className="size-4" aria-hidden="true" />
              Import
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <QrCode className="size-4" aria-hidden="true" />
              Share
            </Button>
            <input
              ref={importRef}
              type="file"
              accept=".json"
              className="hidden"
              aria-hidden="true"
              onChange={handleImport}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" aria-label="More options">
                  <MoreVertical className="size-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-40">
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setResetConfirmOpen(true)}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Reset all data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Desktop tab nav — hidden on mobile */}
        <nav className="hidden sm:flex max-w-4xl mx-auto px-4 gap-1" aria-label="Main navigation" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-foreground text-foreground font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-4xl w-full mx-auto px-4 py-6 flex-1 pb-20 sm:pb-6">
        {activeTab === "setup" && (
          <div role="tabpanel" id="panel-setup" aria-label="Setup">
            <SetupView ptoTypes={data.ptoTypes} onChange={setPtoTypes} />
          </div>
        )}
        {activeTab === "about" && (
          <div role="tabpanel" id="panel-about" aria-label="About" className="space-y-6 max-w-prose">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">What is this?</h2>
              <p className="text-muted-foreground text-sm">PTO Planner helps you track and plan your PTO usage across one or more PTO buckets. Add upcoming trips and time off so you can plan your PTO budget in advance.</p>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Your data</h2>
              <p className="text-muted-foreground text-sm">Everything lives in your browser. No account, no server. Use <span className="font-medium text-foreground">Backup</span> to save a copy of your data as a JSON file, and <span className="font-medium text-foreground">Import</span> to restore it. Use <span className="font-medium text-foreground">Share</span> to transfer your data to another device via QR code or link.</p>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <p className="text-sm font-medium">Made by <a href="https://lindallrobinson.com" target="_blank" rel="noopener noreferrer" className="border-b border-current hover:opacity-70 transition-opacity">Lindall Robinson</a>, artist, designer, human.</p>
              <a
                href="https://ko-fi.com/lindall"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-baseline gap-1 text-sm text-primary border-b border-primary hover:opacity-70 transition-opacity"
              >
                ☕ Buy me <RouletteWord /> on Ko-fi
              </a>
            </div>
          </div>
        )}
        {activeTab === "timeline" && (
          <div role="tabpanel" id="panel-timeline" aria-label="Timeline">
            <TimelineView ptoTypes={data.ptoTypes} events={data.events} onEventsChange={setEvents} onPtoTypesChange={setPtoTypes} onNavigate={setActiveTab} />
          </div>
        )}
      </main>

      {/* Mobile bottom nav — hidden on desktop */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 border-t bg-background" aria-label="Main navigation">
        <div className="flex" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "text-primary font-semibold border-t-2 border-primary -mt-px"
                  : "text-muted-foreground hover:text-primary border-t-2 border-transparent -mt-px"
              )}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={() => setMoreOpen(true)}
            aria-label="More options"
            className="flex-1 py-3 text-sm font-medium text-primary hover:text-primary transition-colors border-t-2 border-transparent -mt-px flex items-center justify-center"
          >
            <MoreVertical className="size-5" aria-hidden="true" />
          </button>
        </div>
      </nav>

      <ConfirmDialog
        open={resetConfirmOpen}
        onOpenChange={setResetConfirmOpen}
        title="Reset all data?"
        message="This will permanently delete all your PTO types and events. This cannot be undone."
        confirmLabel="Reset all data"
        onConfirm={handleReset}
      />

      {/* Mobile more sheet */}
      <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>More</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 flex flex-col gap-3">
            <Button variant="outline" className="h-12 justify-start gap-3 bg-white text-base" onClick={handleExport}>
              <Download className="size-5" aria-hidden="true" />
              Backup
            </Button>
            <Button variant="outline" className="h-12 justify-start gap-3 bg-white text-base" onClick={() => importRef.current?.click()}>
              <Upload className="size-5" aria-hidden="true" />
              Import
            </Button>
            <input
              ref={importRef}
              type="file"
              accept=".json"
              className="hidden"
              aria-hidden="true"
              onChange={handleImport}
            />
            <Button variant="outline" className="h-12 justify-start gap-3 bg-white text-base" onClick={handleShare}>
              <QrCode className="size-5" aria-hidden="true" />
              Share
            </Button>
            <Button
              variant="outline"
              className="h-11 justify-start gap-3 bg-white text-destructive hover:text-destructive"
              onClick={() => { setMoreOpen(false); setResetConfirmOpen(true) }}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Reset all data
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Share</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <QRCodeSVG value={qrUrl} size={typeof window !== "undefined" && window.innerWidth < 640 ? window.innerWidth - 64 : 400} />
            <p className="text-sm text-muted-foreground text-center">Scan on another device, or copy the link and open it in any browser.</p>
            <Button variant="outline" className="w-full h-12 gap-2 text-base" onClick={() => {
              navigator.clipboard.writeText(qrUrl)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}>
              {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
              {copied ? "Copied!" : "Copy link"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  )
}
