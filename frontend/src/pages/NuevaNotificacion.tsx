import { useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  ChevronRight,
  Eye,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notificacionesApi, type ClienteAutocompleteItem } from "@/services/notifications.api";

const SPECIAL_KEYS = [
  { label: "Nombre de contacto", value: ":contact_name:" },
  { label: "Empresa", value: ":company_name:" },
  { label: "Nro. de orden", value: ":code:" },
  { label: "Estado", value: ":status:" },
  { label: "Fecha", value: ":date:" },
];

const NuevaNotificacion = () => {
  const [asunto, setAsunto] = useState(":company_name: Cambio de estado orden #:code:");
  const [cuerpo, setCuerpo] = useState("<p>Estimado <strong>:contact_name:</strong>,</p><p>A continuación se muestra el estado de su despacho.</p>");
  const [piePagina, setPiePagina] = useState("");
  const [notifType, setNotifType] = useState("entregado");
  const [destinatarioEmail, setDestinatarioEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [suggestions, setSuggestions] = useState<ClienteAutocompleteItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const asuntoRef = useRef<HTMLInputElement>(null);
  const cuerpoRef = useRef<ReactQuill>(null);
  const piePaginaRef = useRef<ReactQuill>(null);

  const insertToAsunto = (key: string) => {
    const input = asuntoRef.current;
    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newAsunto = asunto.substring(0, start) + key + asunto.substring(end);
      setAsunto(newAsunto);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + key.length, start + key.length);
      }, 0);
    } else {
      setAsunto((prev) => prev + key);
    }
  };

  const insertToQuill = (ref: React.RefObject<ReactQuill>, key: string) => {
    const editor = ref.current?.getEditor();
    if (editor) {
      const range = editor.getSelection();
      const position = range ? range.index : editor.getLength();
      editor.insertText(position, key);
      editor.setSelection(position + key.length, 0);
    }
  };

  const modules = useMemo(
    () => ({
      toolbar: [
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link"],
        ["clean"],
      ],
    }),
    []
  );

  const handleEmailChange = (value: string) => {
    setDestinatarioEmail(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const items = await notificacionesApi.buscarClientes(value);
        setSuggestions(items);
        setShowSuggestions(items.length > 0);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 250);
  };

  const selectSuggestion = (item: ClienteAutocompleteItem) => {
    setDestinatarioEmail(item.email);
    setShowSuggestions(false);
  };

  const handleSend = async () => {
    if (!destinatarioEmail.trim()) {
      setSendResult({ success: false, message: "Debe ingresar un email de destinatario." });
      return;
    }
    setSending(true);
    setSendResult(null);
    try {
      const contenidoPlano = cuerpoRef.current
        ?.getEditor()
        ?.getText()
        .trim();
      const contenidoHtml = cuerpo;
      const pieHtml = piePagina;

      const htmlCompleto = contenidoHtml + (pieHtml ? `<br/><br/>${pieHtml}` : "");
      const planoCompleto = (contenidoPlano || "")
        + (piePaginaRef.current?.getEditor()?.getText()?.trim()
          ? "\n\n" + piePaginaRef.current!.getEditor()!.getText().trim()
          : "");

      const res = await notificacionesApi.enviar({
        destinatarioEmail: destinatarioEmail.trim(),
        asunto,
        contenidoPlano: planoCompleto || undefined,
        contenidoHtml: htmlCompleto || undefined,
      });
      setSendResult({ success: true, message: `Email enviado con ID: ${res.messageId}` });
    } catch (err: any) {
      setSendResult({ success: false, message: err.message || "Error al enviar el email." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-2 px-6 py-4 text-sm font-medium text-muted-foreground border-b border-border/50">
        <Link to="/configuracion/notificaciones" className="hover:text-primary transition-colors">
          Notificaciones
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground font-semibold">Nueva notificación</span>
      </div>

      <div className="p-6">
        <div className="flex w-full flex-col gap-6 lg:flex-row">
          {/* Main Content (Left) */}
          <main className="flex-1 space-y-6">
            {/* Name Section */}
            <div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-md p-5 shadow-sm space-y-3">
              <Label className="text-sm uppercase tracking-wider text-muted-foreground">NOMBRE</Label>
              <Input className="bg-transparent border-border/100 h-11 text-sm" />
            </div>

            {/* Email Personalization */}
            <div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-md shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">PERSONALIZACIÓN DE EMAIL</h3>
                <Button variant="link" className="text-primary text-sm h-auto p-0 font-bold">
                   <Eye className="size-4" />
                   Previsualizar
                </Button>
              </div>
              
              <div className="p-5 space-y-6">

                {/* Sender and Subject */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Remitente</Label>
                    </div>
                    <Input value="DYD PROYECTOS MULTIPLES Y SERVICIOS GENERAL" disabled className="bg-transparent text-sm border-border h-11" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Asunto</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-xs font-medium text-gray-500  flex items-center gap-1 hover:text-primary/80 transition-colors">
                            Agregar llaves especiales
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          {SPECIAL_KEYS.map((key) => (
                            <DropdownMenuItem
                              key={key.value}
                              onClick={() => insertToAsunto(key.value)}
                              className="flex items-center justify-between cursor-pointer"
                            >
                              <span>{key.label}</span>
                              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{key.value}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2 border border-border rounded-md bg-transparent px-3 h-11 overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                      <input
                        ref={asuntoRef}
                        type="text"
                        value={asunto}
                        onChange={(e) => setAsunto(e.target.value)}
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        placeholder="Ingrese el asunto..."
                      />
                    </div>
                  </div>
                </div>

                {/* Body / Rich Text Area */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Cuerpo</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-xs font-medium text-gray-500  flex items-center gap-1 hover:text-primary/80 transition-colors">
                          Agregar llaves especiales
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        {SPECIAL_KEYS.map((key) => (
                          <DropdownMenuItem
                            key={key.value}
                            onClick={() => insertToQuill(cuerpoRef, key.value)}
                            className="flex items-center justify-between cursor-pointer"
                          >
                            <span>{key.label}</span>
                            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{key.value}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="rounded-md border border-border bg-transparent overflow-hidden [&_.ql-toolbar]:!border-none [&_.ql-toolbar]:!border-b [&_.ql-toolbar]:!border-border [&_.ql-toolbar]:!bg-muted/50 [&_.ql-container]:!border-none [&_.ql-container]:!text-sm [&_.ql-container]:!font-sans [&_.ql-editor]:min-h-[120px]">
                    <ReactQuill 
                      ref={cuerpoRef}
                      theme="snow" 
                      value={cuerpo} 
                      onChange={setCuerpo} 
                      modules={modules} 
                      placeholder="Escriba el cuerpo del mensaje..."
                    />
                  </div>
                </div>

                {/* Footer Text */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Texto pie de página</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-xs font-medium text-gray-500  flex items-center gap-1 hover:text-primary/80 transition-colors">
                          Agregar llaves especiales
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        {SPECIAL_KEYS.map((key) => (
                          <DropdownMenuItem
                            key={key.value}
                            onClick={() => insertToQuill(piePaginaRef, key.value)}
                            className="flex items-center justify-between cursor-pointer"
                          >
                            <span>{key.label}</span>
                            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{key.value}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="rounded-md border border-border bg-transparent overflow-hidden [&_.ql-toolbar]:!border-none [&_.ql-toolbar]:!border-b [&_.ql-toolbar]:!border-border [&_.ql-toolbar]:!bg-muted/50 [&_.ql-container]:!border-none [&_.ql-container]:!text-sm [&_.ql-container]:!font-sans [&_.ql-editor]:min-h-[80px]">
                    <ReactQuill 
                      ref={piePaginaRef}
                      theme="snow" 
                      value={piePagina} 
                      onChange={setPiePagina} 
                      modules={modules} 
                      placeholder="Escriba el pie de página..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Sidebar (Right) */}
          <aside className="w-full shrink-0 space-y-6 lg:w-96">
            <div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-md p-5 shadow-sm space-y-6">
              {/* Type and Substatus */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipo de notificación</Label>
                  <Select value={notifType} onValueChange={setNotifType}>
                    <SelectTrigger className="bg-muted/30 border-border/50 h-11 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente" className="text-sm">Pendiente</SelectItem>
                      <SelectItem value="entregado" className="text-sm">Entregado</SelectItem>
                      <SelectItem value="no-entregado" className="text-sm">No entregado</SelectItem>
                      <SelectItem value="entrega-parcial" className="text-sm">Entrega parcial</SelectItem>
                      <SelectItem value="pre-entrega" className="text-sm">Pre-entrega</SelectItem>
                      <SelectItem value="atraso" className="text-sm">Atraso</SelectItem>
                      <SelectItem value="inicio-ruta" className="text-sm">Inicio ruta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {notifType === "pre-entrega" ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Distancia para notificar (metros)</Label>
                      <Input type="number" defaultValue="500" className="bg-transparent border-border h-11 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tiempo para notificar (minutos)</Label>
                      <Input type="number" defaultValue="5" className="bg-transparent border-border h-11 text-sm" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subestados</Label>
                    <Select defaultValue="todos">
                      <SelectTrigger className="bg-muted/30 border-border/50 h-11 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos" className="text-sm">Todos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Notification Targets */}
              <div className="space-y-4 pt-2 border-t border-border">
                <div className="space-y-2 relative">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email destinatario</Label>
                  <Input
                    type="email"
                    placeholder="cliente@ejemplo.com"
                    value={destinatarioEmail}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="bg-transparent border-border h-11 text-sm"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 rounded-md border border-border/60 bg-card shadow-lg max-h-56 overflow-y-auto">
                      {suggestions.map((item) => (
                        <div
                          key={item.id}
                          className="px-3 py-2.5 cursor-pointer hover:bg-muted/60 border-b border-border/50 last:border-b-0"
                          onMouseDown={(e) => { e.preventDefault(); selectSuggestion(item); }}
                        >
                          <p className="text-sm font-medium truncate">{item.email}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.director && `${item.director} — `}{item.nombreIiee}
                            {item.codigoModular && ` [${item.codigoModular}]`}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {sendResult && (
                <div className={cn(
                  "flex items-center gap-2 rounded-md p-3 text-sm",
                  sendResult.success
                    ? "bg-success/10 text-success border border-success/20"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                )}>
                  {sendResult.success ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
                  <span>{sendResult.message}</span>
                </div>
              )}

              <Button
                className="w-full bg-primary text-white hover:bg-primary-hover shadow-glow h-11 font-bold"
                onClick={handleSend}
                disabled={sending}
              >
                {sending ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : (
                  <Save className="size-4 mr-2" />
                )}
                {sending ? "Enviando..." : "Guardar y enviar"}
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default NuevaNotificacion;
