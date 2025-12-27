import { useState, useRef, useEffect } from "react";


export function Divination() {
    const [question, setQuestion] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const API_URL = "http://127.0.0.1:8001/divination/cast";

    const messages = [
        "请在心中默想问题...",
        "正在将硬币抛向空中...",
        "正在排卦...",
        "正在翻阅古籍...",
        "正在解读卦象..."
    ];

    const castDivination = async () => {
        if (!question.trim()) {
            alert("请输入事项");
            return;
        }

        setIsLoading(true);
        setError(null);
        setLoadingMessage(messages[0]);
        let msgIndex = 0;

        // Loading message rotation
        const intervalId = setInterval(() => {
            msgIndex++;
            if (msgIndex < messages.length) {
                setLoadingMessage(messages[msgIndex]);
            }
        }, 1500);

        try {
            // Minimum waiting time to show the messages
            const minWait = new Promise(resolve => setTimeout(resolve, 4500));

            const apiCall = fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question })
            }).then(res => {
                if (!res.ok) throw new Error("API call failed");
                return res.json();
            });

            const [_, data] = await Promise.all([minWait, apiCall]);
            setResult(data);

        } catch (err: any) {
            console.error(err);
            setError("占卜过程中出现了问题，请稍后再试。");
        } finally {
            clearInterval(intervalId);
            setIsLoading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setQuestion("");
        setError(null);
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-[70] bg-background text-foreground flex flex-col items-center justify-center">
                <div className="circle-container mb-8">
                    {/* Placeholder for spinner if needed, or just CSS animation */}
                    <div className="w-16 h-16 border-4 border-foreground border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="text-xl tracking-widest animate-pulse">{loadingMessage}</div>
            </div>
        );
    }

    if (result) {
        const { time_construct, hexagram, ai_analysis } = result;
        const base = hexagram.base;
        const variant = hexagram.changed;

        return (
            <div className="w-full max-w-3xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Info */}
                <div className="border-b border-border pb-4 space-y-2">
                    <div className="text-sm tracking-widest text-muted-foreground">所问何事</div>
                    <div className="text-xl font-serif text-foreground">{question}</div>
                </div>

                {/* Time & Meta */}
                <div className="flex justify-between text-xs tracking-wider text-muted-foreground font-mono">
                    <div>
                        {time_construct.year.gan_zhi}年 {time_construct.month.gan_zhi}月 {time_construct.day.gan_zhi}日
                    </div>
                    <div>
                        空亡: {Array.isArray(time_construct.kong_wang.day) ? time_construct.kong_wang.day.join('') : time_construct.kong_wang.day}
                    </div>
                </div>

                {/* Hexagram Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-y border-border py-8">
                    {/* Main Hexagram */}
                    <div className="space-y-6">
                        <div className="text-center space-y-1">
                            <div className="text-2xl font-serif">{base.name}</div>
                            <div className="text-xs text-muted-foreground">{base.palace_name}宫</div>
                        </div>
                        <div className="flex flex-col-reverse gap-3">
                            {base.lines.map((line: any, idx: number) => (
                                <HexLine key={idx} line={line} isVariant={false} />
                            ))}
                        </div>
                    </div>

                    {/* Variant Hexagram (if exists) */}
                    {variant && (
                        <div className="space-y-6">
                            <div className="text-center space-y-1">
                                <div className="text-2xl font-serif">{variant.name}</div>
                                <div className="text-xs text-muted-foreground">变卦</div>
                            </div>
                            <div className="flex flex-col-reverse gap-3">
                                {variant.lines.map((line: any, idx: number) => (
                                    <HexLine key={idx} line={line} isVariant={true} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* AI Analysis */}
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-serif tracking-widest border-l-2 border-foreground pl-4">解卦分析</h3>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none leading-relaxed text-muted-foreground font-serif">
                        <MarkdownRenderer content={ai_analysis.response} />
                    </div>
                </div>

                <button
                    onClick={reset}
                    className="mx-auto block px-8 py-3 border border-border text-sm tracking-widest hover:bg-muted/50 transition-colors"
                >
                    再问一卦
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-xl mx-auto space-y-12 py-12 animate-in fade-in duration-500">
            <div className="space-y-4 border-l-2 border-foreground pl-6">
                <h1 className="text-4xl font-serif tracking-widest">每问事</h1>
                <div className="text-muted-foreground italic font-serif">“子入太廟，每事問。”</div>
            </div>

            <div className="space-y-4">
                <label className="block text-xs tracking-widest text-muted-foreground">事项描述 QUERY</label>
                <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="请输入您欲问之事..."
                    className="w-full h-40 bg-transparent border border-border p-4 text-lg font-serif italic outline-none focus:border-foreground transition-colors resize-none placeholder:text-muted-foreground/30"
                />
            </div>

            <button
                onClick={castDivination}
                className="w-full py-4 bg-foreground text-background text-lg tracking-[0.5em] hover:opacity-90 transition-opacity"
            >
                问卜
            </button>
        </div>
    );
}

function HexLine({ line, isVariant }: { line: any, isVariant: boolean }) {
    // Yao Bar visual
    const isYin = line.ying_yang === 'Yin';

    return (
        <div className="flex items-center h-8">
            {/* Left Info (Main only) */}
            {!isVariant && (
                <div className="grid grid-cols-[30px_70px_80px] gap-2 text-xs text-center text-muted-foreground mr-4 shrink-0 font-serif">
                    <span className="font-bold text-foreground/70">{line.six_god}</span>
                    <span className="flex justify-center gap-1">
                        {line.hidden && <span className="text-[10px] scale-90 opacity-70">伏 {line.hidden.relation}</span>}
                    </span>
                    <span className="font-bold text-foreground">{line.relation} {line.branch}{line.element}</span>
                </div>
            )}

            {/* Variant Left Info (Simple) */}
            {isVariant && (
                <div className="w-24 text-xs text-right text-muted-foreground mr-4 shrink-0 font-serif">
                    {line.relation} {line.branch}{line.element}
                </div>
            )}

            {/* The Line Bar */}
            <div className="w-24 h-2 flex justify-between relative shrink-0">
                {isYin ? (
                    <>
                        <div className="w-[42%] h-full bg-foreground"></div>
                        <div className="w-[42%] h-full bg-foreground"></div>
                    </>
                ) : (
                    <div className="w-full h-full bg-foreground"></div>
                )}

                {/* Moving Dot / Role Marker */}
                <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex gap-2 items-center">
                    {line.changing && !isVariant && (
                        <span className="text-[10px] text-muted-foreground">{isYin ? '✕' : '○'}</span>
                    )}
                    {line.role && !isVariant && (
                        <span className="text-[9px] border border-red-800 text-red-500 px-0.5 leading-none">{line.role}</span>
                    )}
                </div>
            </div>
        </div>
    )
}

function MarkdownRenderer({ content }: { content: string }) {
    // ReactMarkdown caused DOM issues ('removeChild' error).
    // Fallback to simple text rendering for stability.
    const cleanText = content
        .replace(/^\s*#+\s+/gm, "")
        .replace(/\n{3,}/g, "\n\n");

    return <div className="markdown-body whitespace-pre-wrap font-serif leading-relaxed opacity-90">{cleanText}</div>;
}
