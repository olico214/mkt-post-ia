import { NextResponse } from "next/server";

// Actualizamos la función para recibir el 'userToken'
async function fetchAIGeneration(systemPrompt, userDescription, userToken) {
    // Define a qué servicio de IA te conectas (OpenAI, Ollama, OpenClaw, etc.)
    const aiEndpoint = process.env.AI_API_URL || "https://api.openai.com/v1/chat/completions";

    const response = await fetch(aiEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            // Aquí usamos el token que el usuario escribió en el frontend
            "Authorization": `Bearer ${userToken}`,
        },
        body: JSON.stringify({
            model: process.env.AI_MODEL || "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userDescription }
            ],
            temperature: 0.7,
            max_tokens: 500,
        }),
    });

    // Si el token del usuario es inválido, la API de IA devolverá un error (ej. 401 Unauthorized)
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Lanzamos el error con el mensaje de la IA para que el frontend sepa qué pasó
        throw new Error(errorData.error?.message || `Error en la IA: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { token, description } = body;

        // Validación básica
        if (!token) {
            return NextResponse.json(
                { error: "Falta el token de autorización." },
                { status: 400 }
            );
        }

        if (!description) {
            return NextResponse.json(
                { error: "Falta la descripción del producto." },
                { status: 400 }
            );
        }

        // 3. Definir los Prompts Internos (Cortos, para FB/IG con objetivos precisos y hashtags)
        const prompts = [
            {
                title: "Opción 1: Objetivo LIKES (Interacción Rápida)",
                systemPrompt: `Eres un experto en engagement para Instagram y Facebook. 
        Tu objetivo es crear un copy MUY BREVE (máximo 2 a 3 líneas) sobre el producto/servicio del usuario.
        Reglas:
        - El objetivo único es conseguir "Me gusta" (Likes).
        - Genera empatía inmediata o haz una pregunta cerrada y fácil de responder ("¿Team A o Team B?", "¿Quién más lo necesita?").
        - Cero lenguaje de ventas. Tiene que sentirse casual y visual.
        - Usa 1 o 2 emojis máximo en el texto.
        - Obligatorio: Al final del texto, incluye una línea separada con 4 a 6 hashtags relevantes al producto para maximizar el alcance orgánico.`
            },
            {
                title: "Opción 2: Objetivo CONTRATACIÓN (Venta y DM)",
                systemPrompt: `Eres un closer de ventas para redes sociales. 
        Tu objetivo es crear un copy DIRECTO Y BREVE (máximo 3 a 4 líneas) para Facebook e Instagram.
        Reglas:
        - El objetivo es conseguir clientes (Mensajes directos, cotizaciones o clics al enlace).
        - Línea 1: Menciona el problema que resuelves o el beneficio principal directo al grano.
        - Línea 2: Explica qué ofreces.
        - Línea 3: Un Call to Action (CTA) agresivo y claro (Ej: "Envía un DM para cotizar", "Haz clic en la bio para agendar").
        - Tono profesional, seguro y persuasivo.
        - Obligatorio: Al final del texto, incluye una línea separada con 4 a 6 hashtags transaccionales o de búsqueda de servicios.`
            },
            {
                title: "Opción 3: Objetivo SEGUIDORES (Valor y Curiosidad)",
                systemPrompt: `Eres un growth hacker de redes sociales. 
        Tu objetivo es crear un copy BREVE (máximo 3 líneas) para Instagram y Facebook.
        Reglas:
        - El objetivo es conseguir que nuevos usuarios le den a "Seguir" (Follow).
        - Da un micro-tip muy valioso, un dato curioso o muestra autoridad sobre el producto/servicio.
        - El cierre debe pedir explícitamente el follow justificando el por qué (Ej: "Síguenos para más tips sobre...", "Sigue la cuenta para no perderte el próximo lanzamiento").
        - Obligatorio: Al final del texto, incluye una línea separada con 4 a 6 hashtags de nicho para atraer nueva audiencia interesada en el tema.`
            }
        ];

        // Ejecutamos las llamadas en paralelo, pasando el token del usuario a cada una
        const generationPromises = prompts.map(async (p) => {
            const content = await fetchAIGeneration(p.systemPrompt, description, token);
            return {
                title: p.title,
                content: content.trim()
            };
        });

        const results = await Promise.all(generationPromises);

        // Devolvemos los 3 resultados exitosos
        return NextResponse.json({ results }, { status: 200 });

    } catch (error) {
        console.error("Error en la orquestación:", error.message);
        // Devolvemos el error al frontend (ej. "Incorrect API key provided")
        return NextResponse.json(
            { error: error.message || "Error al generar el contenido." },
            { status: 500 }
        );
    }
}