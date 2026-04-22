"use client"
import React, { useState } from 'react';

// Iconos minimalistas
const Icons = {
    Sparkles: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
    Image: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Text: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" /></svg>,
    ArrowLeft: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
};

const ZenMarketingStudio = () => {
    const [token, setToken] = useState('');
    const [description, setDescription] = useState('');
    const [view, setView] = useState('login'); // 'login', 'input', 'results'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Resultados de la IA
    const [results, setResults] = useState([]);
    const [imageUrl, setImageUrl] = useState('');
    const [activeTab, setActiveTab] = useState(0); // 0,1,2 para textos, 3 para imagen

    const handleLogin = (e) => {
        e.preventDefault();
        if (token.length > 10) setView('input');
        else setError('Token inválido.');
    };

    const generateContent = async () => {
        setLoading(true);
        setError('');

        try {
            // Llamada a tu API (que ahora también debe generar la imagen)
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, description }),
            });

            if (!response.ok) throw new Error('Error al conectar con la IA');

            const data = await response.json();
            setResults(data.results);
            setImageUrl(data.imageUrl); // Esperamos que la API devuelva una URL de imagen
            setView('results');
            setActiveTab(0);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- VISTA 1: LOGIN MINIMALISTA ---
    if (view === 'login') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 font-sans selection:bg-indigo-500/30">
                <div className="w-full max-w-sm px-6">
                    <div className="flex justify-center mb-8 text-indigo-400">
                        <Icons.Sparkles />
                    </div>
                    <h1 className="text-2xl font-light text-center text-zinc-100 mb-8 tracking-wide">
                        Ingresa tu <span className="font-semibold">Clave de Acceso</span>
                    </h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            placeholder="sk-..."
                            className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-indigo-500/50 rounded-lg px-4 py-3 text-zinc-200 placeholder-zinc-600 outline-none transition-all text-center tracking-widest"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            autoFocus
                        />
                        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                        <button className="w-full bg-zinc-100 hover:bg-white text-zinc-900 font-medium py-3 rounded-lg transition-colors">
                            Continuar
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // --- VISTA 2: ENTRADA DE DATOS (Limpia y centrada) ---
    if (view === 'input') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 p-6">
                <div className="w-full max-w-2xl bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 md:p-12 backdrop-blur-xl shadow-2xl">
                    <h2 className="text-3xl font-semibold text-zinc-100 mb-2">¿Qué vamos a promocionar hoy?</h2>
                    <p className="text-zinc-400 mb-8">Describe tu producto. La IA orquestará el copy y diseñará el material visual.</p>

                    <textarea
                        className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-indigo-500/50 rounded-xl p-5 h-48 text-zinc-200 outline-none resize-none transition-all text-lg leading-relaxed shadow-inner"
                        placeholder="Ej: Un café de especialidad cultivado en las montañas, tostado oscuro, ideal para empezar la mañana con energía..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={generateContent}
                            disabled={loading || !description}
                            className={`px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${loading
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40'
                                }`}
                        >
                            {loading ? (
                                <>Generando activos...</>
                            ) : (
                                <>Orquestar Campaña <Icons.Sparkles /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- VISTA 3: RESULTADOS (Sistema de Tabs) ---
    return (
        <div className="min-h-screen bg-zinc-950 p-6 md:p-12 text-zinc-200">
            <div className="max-w-4xl mx-auto">

                {/* Cabecera de resultados */}
                <button
                    onClick={() => setView('input')}
                    className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors mb-8 group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform"><Icons.ArrowLeft /></span>
                    Nueva Generación
                </button>

                {/* Navegación por Pestañas (Tabs) */}
                <div className="flex flex-wrap gap-2 mb-8 p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl w-fit">
                    {results.map((res, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveTab(idx)}
                            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === idx ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                        >
                            <Icons.Text /> {res.title.split(':')[0]} {/* Solo muestra "Opción 1", etc. */}
                        </button>
                    ))}
                    {imageUrl && (
                        <button
                            onClick={() => setActiveTab(3)}
                            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 3 ? 'bg-indigo-500/20 text-indigo-300 shadow ring-1 ring-indigo-500/30' : 'text-zinc-400 hover:text-indigo-400'
                                }`}
                        >
                            <Icons.Image /> Material Visual
                        </button>
                    )}
                </div>

                {/* Área de Visualización de Contenido */}
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 md:p-10 min-h-[400px]">
                    {activeTab < 3 ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <h3 className="text-xl font-medium text-indigo-300 mb-6 pb-4 border-b border-zinc-800/50">
                                {results[activeTab]?.title}
                            </h3>
                            <p className="text-zinc-300 leading-loose whitespace-pre-wrap text-lg font-light">
                                {results[activeTab]?.content}
                            </p>
                            <button
                                onClick={() => navigator.clipboard.writeText(results[activeTab]?.content)}
                                className="mt-8 text-sm text-zinc-500 hover:text-zinc-300 transition-colors border border-zinc-800 hover:border-zinc-600 px-4 py-2 rounded-lg"
                            >
                                Copiar al portapapeles
                            </button>
                        </div>
                    ) : (
                        <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center">
                            <h3 className="text-xl font-medium text-indigo-300 mb-6 w-full text-left">Imagen Generada</h3>
                            <div className="relative group rounded-xl overflow-hidden ring-1 ring-zinc-800 shadow-2xl">
                                <img
                                    src={imageUrl}
                                    alt="Generado por IA"
                                    className="w-full max-w-2xl object-cover"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <a href={imageUrl} download="marketing-image.png" className="bg-white text-black px-6 py-2 rounded-full font-medium">
                                        Descargar Imagen
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ZenMarketingStudio;