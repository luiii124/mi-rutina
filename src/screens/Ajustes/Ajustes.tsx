import { useRef, useState } from 'react'
import { BackButton } from '../../components/BackButton'
import { Button } from '../../components/Button'
import { ConfirmPanel } from '../../components/ConfirmPanel'
import { fieldClass } from '../../components/TextField'
import {
  borrarTodosLosDatos,
  exportarCopia,
  importarCopia,
  resumirCopia,
  validarCopia,
  type BackupFile,
} from '../../db/backup'
import { diasDesde, formatearFechaCorta } from '../../domain/dates'
import { updateSettings, useSettings } from '../../hooks/useSettings'

const inputClass = fieldClass

const REST_PRESETS = [60, 90, 120, 180]
const formatearFecha = formatearFechaCorta

export function Ajustes() {
  const settings = useSettings()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingImport, setPendingImport] = useState<BackupFile | null>(null)
  const [confirmandoImport, setConfirmandoImport] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [confirmandoBorrar, setConfirmandoBorrar] = useState(false)
  const [exportando, setExportando] = useState(false)
  const [importando, setImportando] = useState(false)
  const [borrando, setBorrando] = useState(false)

  if (!settings) {
    return (
      <div className="flex items-center gap-1 px-4 py-8">
        <BackButton />
        <h1 className="text-title text-text">Ajustes</h1>
      </div>
    )
  }

  const diasSinCopia = settings.lastBackupAt ? diasDesde(settings.lastBackupAt) : null
  const avisoCopia = diasSinCopia === null || diasSinCopia > 30

  async function handleExportar() {
    setExportando(true)
    try {
      await exportarCopia()
    } finally {
      setExportando(false)
    }
  }

  async function handleArchivoSeleccionado(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setImportError(null)
    try {
      const texto = await file.text()
      const data: unknown = JSON.parse(texto)
      if (!validarCopia(data)) {
        setImportError('Este archivo no es una copia valida de Mi Rutina.')
        return
      }
      setPendingImport(data)
    } catch {
      setImportError('No se ha podido leer el archivo.')
    }
  }

  async function handleConfirmarImportar() {
    if (!pendingImport) return
    setImportando(true)
    try {
      await importarCopia(pendingImport)
      setPendingImport(null)
      setConfirmandoImport(false)
    } finally {
      setImportando(false)
    }
  }

  async function handleBorrarTodo() {
    setBorrando(true)
    try {
      await borrarTodosLosDatos()
      setConfirmandoBorrar(false)
    } finally {
      setBorrando(false)
    }
  }

  const resumen = pendingImport ? resumirCopia(pendingImport) : null

  return (
    <div className="flex flex-col gap-8 px-4 py-8 pb-12">
      <div className="flex items-center gap-1">
        <BackButton />
        <h1 className="text-title text-text">Ajustes</h1>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-label uppercase text-text-secondary">Unidad de peso</h2>
        <div className="flex overflow-hidden rounded-field border border-border bg-surface-raised">
          {(['kg', 'lb'] as const).map((unit) => (
            <button
              key={unit}
              type="button"
              onClick={() => updateSettings({ unit })}
              className={`flex-1 py-3 text-body ${
                settings.unit === unit ? 'bg-border text-text' : 'text-text-secondary'
              }`}
            >
              {unit}
            </button>
          ))}
        </div>
        <p className="text-caption text-text-secondary">
          Solo cambia como se muestran los pesos. Tu historial no se altera.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-label uppercase text-text-secondary">Descanso por defecto</h2>
        <div className="flex gap-2">
          {REST_PRESETS.map((seconds) => (
            <button
              key={seconds}
              type="button"
              onClick={() => updateSettings({ defaultRestSeconds: seconds })}
              className={`flex-1 rounded-field border border-border py-3 text-body ${
                settings.defaultRestSeconds === seconds
                  ? 'bg-border text-text'
                  : 'bg-surface-raised text-text-secondary'
              }`}
            >
              {seconds}s
            </button>
          ))}
        </div>
        <input
          type="number"
          inputMode="numeric"
          className={inputClass}
          value={settings.defaultRestSeconds}
          onChange={(e) => updateSettings({ defaultRestSeconds: Number(e.target.value) || 0 })}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-label uppercase text-text-secondary">Copia de seguridad</h2>

        <Button variant="secondary" onClick={handleExportar} disabled={exportando}>
          {exportando ? 'Exportando...' : 'Exportar copia'}
        </Button>

        <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
          Importar copia
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleArchivoSeleccionado}
        />

        {importError && <p className="text-caption text-alert">{importError}</p>}

        {resumen && !confirmandoImport && (
          <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
            <p className="text-body text-text">
              Este archivo contiene {resumen.rutinas} rutina{resumen.rutinas === 1 ? '' : 's'} y{' '}
              {resumen.sesiones} sesion{resumen.sesiones === 1 ? '' : 'es'}
              {resumen.desde && resumen.hasta
                ? `, del ${formatearFecha(resumen.desde)} al ${formatearFecha(resumen.hasta)}`
                : ''}
              .
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-[35]" onClick={() => setPendingImport(null)}>
                Cancelar
              </Button>
              <Button variant="primary" className="flex-[65]" onClick={() => setConfirmandoImport(true)}>
                Continuar
              </Button>
            </div>
          </div>
        )}

        {resumen && confirmandoImport && (
          <ConfirmPanel
            message="¿Seguro? Se borrarán todos los datos actuales y se sustituirán por los de este archivo. No se puede deshacer."
            confirmLabel="Sí, sustituir todo"
            onCancel={() => setConfirmandoImport(false)}
            onConfirm={handleConfirmarImportar}
            loading={importando}
          />
        )}

        <p className={`text-caption ${avisoCopia ? 'text-alert' : 'text-text-secondary'}`}>
          {settings.lastBackupAt
            ? `Ultima copia: hace ${diasSinCopia} dia${diasSinCopia === 1 ? '' : 's'}`
            : 'Todavia no has hecho ninguna copia'}
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-label uppercase text-text-secondary">Datos</h2>
        {!confirmandoBorrar ? (
          <Button variant="destructive" onClick={() => setConfirmandoBorrar(true)}>
            Borrar todos los datos
          </Button>
        ) : (
          <ConfirmPanel
            message="¿Estás seguro de que quieres borrar todos los datos? Se perderán todas tus rutinas, entrenos y sesiones para siempre. No se puede deshacer."
            confirmLabel="Sí, borrar todo"
            onCancel={() => setConfirmandoBorrar(false)}
            onConfirm={handleBorrarTodo}
            loading={borrando}
          />
        )}
      </section>

      <p className="text-center text-caption text-text-tertiary">Mi Rutina v0.1.0</p>
    </div>
  )
}
