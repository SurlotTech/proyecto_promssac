package com.promssac.backend.integration.mailersend;

import com.promssac.backend.model.entity.Orden;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class EmailTemplateRenderer {

    private static final String LOGO_FILE = "logo.png";

    private final AssetLoader assetLoader;

    /**
     * Plantilla genérica de notificación con logo, contenido y footer corporativo.
     */
    public String renderizarNotificacion(String contenidoHtml) {
        return envolverConPlantilla(contenidoHtml);
    }

    /**
     * Construye el HTML de notificación de cambio de estado de una orden.
     */
    public String construirCambioEstado(Orden orden, String estadoAnterior, String estadoNuevo) {
        String nombreContacto = StringUtils.hasText(orden.getContactoNombre())
                ? orden.getContactoNombre().trim()
                : "Cliente";

        String nombreCliente = orden.getCliente() != null
                && StringUtils.hasText(orden.getCliente().getNombre())
                ? orden.getCliente().getNombre().trim()
                : "PROMSSAC";

        String html = """
                <p>Estimado/a <strong>%s</strong>,</p>
                <p>El estado de su orden <strong>#%s</strong> ha sido actualizado:</p>
                <table style="border-collapse:collapse;width:100%%;margin:16px 0;">
                    <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;">Estado anterior</td>
                        <td style="padding:8px 12px;border:1px solid #ddd;">%s</td></tr>
                    <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;">Nuevo estado</td>
                        <td style="padding:8px 12px;border:1px solid #ddd;color:#2563eb;font-weight:bold;">%s</td></tr>
                </table>
                <p>Puede hacer seguimiento de su despacho en nuestro portal.</p>
                <p>Saludos,<br/>Equipo %s</p>
                """.formatted(
                    nombreContacto, orden.getNumeroOrden(),
                    estadoAnterior, estadoNuevo,
                    nombreCliente);

        return envolverConPlantilla(html);
    }

    /**
     * Construye el asunto y texto plano para notificación de cambio de estado.
     */
    public NotificacionContenido construirContenidoCambioEstado(Orden orden, String estadoAnterior, String estadoNuevo) {
        String nombreContacto = StringUtils.hasText(orden.getContactoNombre())
                ? orden.getContactoNombre().trim()
                : "Cliente";

        String nombreCliente = orden.getCliente() != null
                && StringUtils.hasText(orden.getCliente().getNombre())
                ? orden.getCliente().getNombre().trim()
                : "PROMSSAC";

        String asunto = nombreCliente + " - Estado de orden #" + orden.getNumeroOrden();

        String plano = "Estimado/a " + nombreContacto + ",\n\n"
                + "El estado de su orden #" + orden.getNumeroOrden() + " ha sido actualizado:\n"
                + "Estado anterior: " + estadoAnterior + "\n"
                + "Nuevo estado: " + estadoNuevo + "\n\n"
                + "Saludos,\nEquipo " + nombreCliente;

        String html = construirCambioEstado(orden, estadoAnterior, estadoNuevo);

        return new NotificacionContenido(asunto, html, plano, nombreContacto);
    }

    public record NotificacionContenido(String asunto, String html, String plano, String nombreContacto) {}

    private String envolverConPlantilla(String contenidoHtml) {
        String logo = assetLoader.dataUri(LOGO_FILE);

        StringBuilder html = new StringBuilder(2048);

        html.append("""
                <!DOCTYPE html>
                <html lang="es">
                <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
                <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
                <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:20px 0;">
                <tr><td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
                """);

        if (StringUtils.hasText(logo)) {
            html.append("""
                    <tr><td align="center" style="padding:24px 24px 0 24px;">
                        <img src="%s" alt="PROMSSAC" style="max-width:200px;height:auto;display:block;" />
                    </td></tr>
                    """.formatted(logo));
        }

        html.append("""
                <tr><td style="padding:24px;color:#333333;font-size:14px;line-height:1.6;">
                %s
                </td></tr>
                """.formatted(contenidoHtml));

        html.append("""
                <tr><td style="padding:0 24px 24px 24px;">
                    <hr style="border:none;border-top:1px solid #e0e0e0;margin:0 0 16px 0;">
                    <p style="color:#999999;font-size:12px;margin:0;">
                        PROMSSAC &mdash; Este es un correo autom&aacute;tico, por favor no responda a esta direcci&oacute;n.
                    </p>
                </td></tr>
                </table>
                </td></tr>
                </table>
                </body>
                </html>
                """);

        return html.toString();
    }
}
