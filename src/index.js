export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // =========================================================
    // API INTERNA PARA EL JSON DE MUESTREO
    // =========================================================
    if (url.pathname === "/api/muestreo") {
      try {
        // -----------------------------------------------------
        // VALIDAR SECRET
        // -----------------------------------------------------
        if (!env.MUESTREO_JSON_URL) {
          return new Response(
            JSON.stringify({
              error: "No existe el Secret MUESTREO_JSON_URL."
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json; charset=UTF-8",
                "Cache-Control": "no-store"
              }
            }
          );
        }

        // -----------------------------------------------------
        // PREPARAR URL DE DROPBOX
        // -----------------------------------------------------
        const origen = new URL(env.MUESTREO_JSON_URL);

        // Parámetro anti-caché
        origen.searchParams.set(
          "cb",
          Date.now().toString()
        );

        // -----------------------------------------------------
        // LEER JSON DESDE DROPBOX
        // -----------------------------------------------------
        const respuesta = await fetch(
          origen.toString(),
          {
            method: "GET",
            headers: {
              "Accept": "application/json"
            }
          }
        );

        // -----------------------------------------------------
        // VALIDAR RESPUESTA
        // -----------------------------------------------------
        if (!respuesta.ok) {
          return new Response(
            JSON.stringify({
              error: "No se pudo obtener MuestreoEstadistico.json.",
              status_origen: respuesta.status
            }),
            {
              status: 502,
              headers: {
                "Content-Type": "application/json; charset=UTF-8",
                "Cache-Control": "no-store"
              }
            }
          );
        }

        // -----------------------------------------------------
        // DEVOLVER JSON
        // -----------------------------------------------------
        const contenido = await respuesta.text();

        return new Response(
          contenido,
          {
            status: 200,
            headers: {
              "Content-Type": "application/json; charset=UTF-8",
              "Cache-Control": "no-store, no-cache, must-revalidate",
              "Pragma": "no-cache",
              "Expires": "0"
            }
          }
        );

      } catch (error) {
        return new Response(
          JSON.stringify({
            error: "Error interno al consultar el JSON.",
            detalle: error?.message || String(error)
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json; charset=UTF-8",
              "Cache-Control": "no-store"
            }
          }
        );
      }
    }

    // =========================================================
    // ARCHIVOS ESTÁTICOS
    // =========================================================
    return env.ASSETS.fetch(request);
  }
};
