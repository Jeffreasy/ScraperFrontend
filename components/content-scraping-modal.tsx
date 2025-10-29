'use client';

import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { cva, type VariantProps } from 'class-variance-authority';
import {
    Loader2,
    FileText,
    CheckCircle,
    XCircle,
    Download,
    MessageSquare,
    Send,
    Zap,
    Globe,
    Rss,
} from 'lucide-react';
import { Article, ChatMessage } from '@/lib/types/api';
import { apiClient } from '@/lib/api/client';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    cn,
    flexPatterns,
    spacing,
    transitions,
    bodyText,
    gap,
    badgeStyles,
    cardStyles,
} from '@/lib/styles/theme';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ContentScrapingModalProps {
    article: Article;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type ScrapingState = 'idle' | 'loading' | 'success' | 'error';
type ExtractionMethod = 'html' | 'browser' | 'rss';
type ViewMode = 'content' | 'chat';

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

const stateBannerVariants = cva(
    ['rounded-lg border p-3 mb-3', transitions.colors],
    {
        variants: {
            state: {
                success: [
                    'border-green-500/50 bg-green-50 dark:bg-green-950/30',
                    'text-green-900 dark:text-green-100',
                ],
                error: [
                    'border-destructive/50 bg-destructive/10',
                    'text-destructive',
                ],
                info: [
                    'border-muted-foreground/30 bg-muted/50',
                ],
            },
        },
        defaultVariants: {
            state: 'info',
        },
    }
);

const viewModeButtonVariants = cva(
    [
        'flex-1 flex items-center justify-center gap-2',
        'px-4 py-2 rounded-lg font-medium',
        transitions.colors,
    ],
    {
        variants: {
            active: {
                true: 'bg-primary text-primary-foreground',
                false: 'bg-muted hover:bg-muted/80',
            },
        },
        defaultVariants: {
            active: false,
        },
    }
);

const extractionBadgeVariants = cva(
    [
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-md border',
        bodyText.xs,
        'font-medium',
    ],
    {
        variants: {
            method: {
                html: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
                browser: 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800',
                rss: 'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
            },
        },
    }
);

const chatMessageVariants = cva(
    ['max-w-[80%] rounded-lg p-3'],
    {
        variants: {
            role: {
                user: 'bg-primary text-primary-foreground',
                assistant: 'bg-card border',
            },
        },
    }
);

const suggestionButtonVariants = cva(
    [
        'px-3 py-2 text-left rounded-md',
        bodyText.xs,
        transitions.colors,
    ],
    {
        variants: {
            variant: {
                default: 'bg-muted hover:bg-muted/80',
                outline: 'border border-input hover:bg-accent',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Zojuist';
    if (diffMins < 60) return `${diffMins} min geleden`;
    if (diffHours < 24) return `${diffHours} uur geleden`;
    if (diffDays < 7) return `${diffDays} dag${diffDays > 1 ? 'en' : ''} geleden`;

    return date.toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'short',
        year: diffDays > 365 ? 'numeric' : undefined,
    });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ContentScrapingModal({
    article,
    open,
    onOpenChange,
}: ContentScrapingModalProps) {
    const queryClient = useQueryClient();
    const [state, setState] = useState<ScrapingState>(
        article.content_extracted && article.content ? 'success' : 'idle'
    );
    const [scrapedContent, setScrapedContent] = useState<string>(article.content || '');
    const [characterCount, setCharacterCount] = useState<number>(article.content?.length || 0);
    const [extractionMethod, setExtractionMethod] = useState<ExtractionMethod | undefined>();
    const [extractionTimeMs, setExtractionTimeMs] = useState<number | undefined>();
    const [error, setError] = useState<string>('');
    const [viewMode, setViewMode] = useState<ViewMode>('content');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isSendingChat, setIsSendingChat] = useState(false);
    const [chatError, setChatError] = useState<string>('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const handleScrape = async () => {
        setState('loading');
        setError('');

        try {
            const response = await apiClient.extractArticleContent(article.id);

            if (response.success && response.data) {
                setCharacterCount(response.data.characters);
                setExtractionMethod(response.data.extraction_method);
                setExtractionTimeMs(response.data.extraction_time_ms);

                const articleResponse = await apiClient.getArticle(article.id);

                if (articleResponse.success && articleResponse.data?.content) {
                    setScrapedContent(articleResponse.data.content);
                    setState('success');

                    queryClient.invalidateQueries({ queryKey: ['articles'] });
                    queryClient.setQueryData(['article', article.id], articleResponse);
                } else {
                    throw new Error('Content niet beschikbaar');
                }
            } else {
                throw new Error(response.error?.message || 'Scraping mislukt');
            }
        } catch (err) {
            setState('error');
            setError(err instanceof Error ? err.message : 'Er ging iets mis bij het scrapen');
            console.error('Scraping error:', err);
        }
    };

    const handleDownload = () => {
        if (!scrapedContent) return;

        const blob = new Blob([scrapedContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${article.title.substring(0, 50)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleSendChat = async () => {
        if (!chatInput.trim() || isSendingChat) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: chatInput.trim(),
            timestamp: new Date().toISOString(),
        };

        setChatMessages((prev) => [...prev, userMessage]);
        setChatInput('');
        setIsSendingChat(true);
        setChatError('');

        try {
            const contentToUse = scrapedContent || article.content || article.summary;
            const articleContentString = `Titel: ${article.title}
Bron: ${article.source}
URL: ${article.url}
Gepubliceerd: ${article.published}

VOLLEDIGE ARTIKEL TEKST:
${contentToUse}`;

            const response = await apiClient.sendChatMessage({
                message: userMessage.content,
                article_content: articleContentString,
                article_id: article.id,
            });

            if (response.success && response.data) {
                const assistantMessage: ChatMessage = {
                    role: 'assistant',
                    content: response.data.message,
                    timestamp: new Date().toISOString(),
                };
                setChatMessages((prev) => [...prev, assistantMessage]);
            } else {
                throw new Error(response.error?.message || 'Chat mislukt');
            }
        } catch (err) {
            setChatError(err instanceof Error ? err.message : 'Er ging iets mis met de chat');
            console.error('Chat error:', err);
        } finally {
            setIsSendingChat(false);
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const resetModal = () => {
        setState('idle');
        setScrapedContent('');
        setCharacterCount(0);
        setExtractionMethod(undefined);
        setExtractionTimeMs(undefined);
        setError('');
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                onOpenChange(isOpen);
                if (!isOpen && state !== 'success') {
                    resetModal();
                }
            }}
        >
            <DialogContent className="max-w-5xl h-[85vh] flex flex-col overflow-hidden">
                <DialogHeader>
                    <DialogTitle className={cn(flexPatterns.start, gap.sm)}>
                        <FileText className="h-5 w-5" />
                        HTML Content Scraping
                    </DialogTitle>
                    <DialogDescription className="text-left">
                        <span className="font-medium">{article.title}</span>
                    </DialogDescription>
                </DialogHeader>

                {/* View Mode Toggle */}
                {state === 'success' && scrapedContent && (
                    <div className={cn('flex', gap.sm, 'border-b pb-2')}>
                        <button
                            onClick={() => setViewMode('content')}
                            className={viewModeButtonVariants({ active: viewMode === 'content' })}
                        >
                            <FileText className="h-4 w-4" />
                            <span>Content</span>
                        </button>
                        <button
                            onClick={() => setViewMode('chat')}
                            className={viewModeButtonVariants({ active: viewMode === 'chat' })}
                        >
                            <MessageSquare className="h-4 w-4" />
                            <span>Chat met AI</span>
                            {chatMessages.length > 0 && (
                                <span className={cn('ml-1 px-1.5 py-0.5', bodyText.xs, 'bg-background/20 rounded')}>
                                    {chatMessages.length}
                                </span>
                            )}
                        </button>
                    </div>
                )}

                <div className={cn('flex-1 overflow-y-auto flex flex-col', gap.md)}>
                    {/* Article Info */}
                    <ArticleInfo article={article} />

                    {/* State Views */}
                    {state === 'idle' && <IdleView article={article} onScrape={handleScrape} />}
                    {state === 'loading' && <LoadingView />}
                    {state === 'error' && <ErrorView article={article} error={error} onRetry={handleScrape} />}
                    {state === 'success' && scrapedContent && viewMode === 'content' && (
                        <ContentView
                            scrapedContent={scrapedContent}
                            characterCount={characterCount}
                            extractionMethod={extractionMethod}
                            extractionTimeMs={extractionTimeMs}
                            article={article}
                            onDownload={handleDownload}
                        />
                    )}
                    {state === 'success' && scrapedContent && viewMode === 'chat' && (
                        <ChatView
                            chatMessages={chatMessages}
                            chatInput={chatInput}
                            setChatInput={setChatInput}
                            isSendingChat={isSendingChat}
                            chatError={chatError}
                            onSendChat={handleSendChat}
                            article={article}
                            characterCount={characterCount}
                            chatEndRef={chatEndRef}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ============================================================================
// SUB COMPONENTS
// ============================================================================

function ArticleInfo({ article }: { article: Article }) {
    return (
        <div className={cn(cardStyles.base, 'bg-muted/50 p-4', spacing.xs)}>
            <div className={cn(flexPatterns.between, bodyText.small)}>
                <span className="text-muted-foreground">Bron:</span>
                <span className="font-medium">{article.source}</span>
            </div>
            <div className={cn(flexPatterns.between, bodyText.small)}>
                <span className="text-muted-foreground">Gepubliceerd:</span>
                <span className="font-medium">{formatRelativeTime(article.published)}</span>
            </div>
            {article.content_extracted && (
                <div className={cn(flexPatterns.between, bodyText.small)}>
                    <span className="text-muted-foreground">Content status:</span>
                    <span className={cn('inline-flex items-center', gap.xs, 'text-green-600 dark:text-green-400')}>
                        <CheckCircle className="h-3 w-3" />
                        Al gescraped
                    </span>
                </div>
            )}
        </div>
    );
}

function IdleView({ article, onScrape }: { article: Article; onScrape: () => void }) {
    return (
        <div className="flex-1 flex flex-col py-4 overflow-y-auto">
            <div className="mb-4">
                <div className={cn(flexPatterns.between, 'mb-3')}>
                    <h3 className={cn(bodyText.small, 'font-semibold text-muted-foreground')}>
                        RSS Samenvatting (Altijd beschikbaar)
                    </h3>
                    <span className={cn(bodyText.xs, 'text-muted-foreground')}>
                        {article.summary.length} karakters
                    </span>
                </div>
                <div className={cn(cardStyles.base, 'p-4')}>
                    <p className={cn(bodyText.small, 'leading-relaxed')}>{article.summary}</p>
                </div>
            </div>

            <div className={cn('rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-6 text-center')}>
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h4 className="text-base font-semibold mb-2">Volledige artikel tekst ophalen?</h4>
                <p className={cn(bodyText.small, 'text-muted-foreground mb-4 max-w-md mx-auto')}>
                    Probeer de volledige HTML content van dit artikel op te halen.
                    <br />
                    <span className={bodyText.xs}>⚠️ Werkt niet altijd (afhankelijk van website)</span>
                </p>
                <Button onClick={onScrape} size="lg">
                    <FileText className="h-4 w-4 mr-2" />
                    Probeer Volledige Tekst Op Te Halen
                </Button>
            </div>
        </div>
    );
}

function LoadingView() {
    return (
        <div className={cn('flex-1 flex flex-col items-center justify-center py-8')}>
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
            <h3 className="text-lg font-semibold mb-2">Content aan het ophalen...</h3>
            <p className={cn(bodyText.small, 'text-muted-foreground')}>
                Even geduld, dit kan enkele seconden duren
            </p>
        </div>
    );
}

function ErrorView({
    article,
    error,
    onRetry,
}: {
    article: Article;
    error: string;
    onRetry: () => void;
}) {
    return (
        <div className="flex-1 flex flex-col py-4 overflow-y-auto">
            <div className={cn(stateBannerVariants({ state: 'error' }), 'mb-4')}>
                <div className={cn('flex items-start', gap.sm)}>
                    <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h4 className={cn(bodyText.small, 'font-semibold mb-1')}>
                            Volledige tekst ophalen mislukt
                        </h4>
                        <p className={cn(bodyText.xs, 'mb-2')}>{error}</p>
                        <p className={cn(bodyText.xs, 'text-muted-foreground')}>
                            Dit kan gebeuren door anti-scraping maatregelen, paywalls, of JavaScript-only content.
                            De RSS samenvatting blijft beschikbaar hieronder.
                        </p>
                    </div>
                </div>
                <div className="mt-3">
                    <Button onClick={onRetry} variant="outline" size="sm">
                        Opnieuw proberen
                    </Button>
                </div>
            </div>

            <div className="flex-1">
                <div className={cn(flexPatterns.between, 'mb-3')}>
                    <h3 className={cn(bodyText.small, 'font-semibold text-muted-foreground')}>
                        RSS Samenvatting (Fallback)
                    </h3>
                    <span className={cn(bodyText.xs, 'text-muted-foreground')}>
                        {article.summary.length} karakters
                    </span>
                </div>
                <div className={cn(cardStyles.base, 'p-4')}>
                    <p className={cn(bodyText.small, 'leading-relaxed')}>{article.summary}</p>
                </div>
            </div>
        </div>
    );
}

interface ContentViewProps {
    scrapedContent: string;
    characterCount: number;
    extractionMethod?: ExtractionMethod;
    extractionTimeMs?: number;
    article: Article;
    onDownload: () => void;
}

function ContentView({
    scrapedContent,
    characterCount,
    extractionMethod,
    extractionTimeMs,
    article,
    onDownload,
}: ContentViewProps) {
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className={stateBannerVariants({ state: 'success' })}>
                <div className={cn(flexPatterns.between, 'mb-2')}>
                    <div className={cn(flexPatterns.start, gap.sm, bodyText.small)}>
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="font-medium">Volledige tekst succesvol opgehaald</span>
                        <span className={cn(bodyText.xs, 'text-green-700 dark:text-green-300')}>
                            ({characterCount.toLocaleString('nl-NL')} karakters)
                        </span>
                    </div>
                    <Button variant="outline" size="sm" onClick={onDownload} className="h-7">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                    </Button>
                </div>
                <div className={cn(flexPatterns.start, gap.sm, 'mt-2')}>
                    {extractionMethod && <ExtractionMethodBadge method={extractionMethod} />}
                    {extractionTimeMs && (
                        <span className={cn(bodyText.xs, 'text-muted-foreground')}>
                            ⏱️ {(extractionTimeMs / 1000).toFixed(2)}s
                        </span>
                    )}
                </div>
            </div>

            <div className={cn('flex-1 overflow-y-auto', cardStyles.base, 'p-4')}>
                <p className={cn('whitespace-pre-wrap break-words', bodyText.small, 'leading-relaxed')}>
                    {scrapedContent}
                </p>
            </div>

            <details className="mt-3">
                <summary className={cn(bodyText.xs, 'text-muted-foreground cursor-pointer hover:text-foreground', transitions.colors)}>
                    Toon originele RSS samenvatting
                </summary>
                <div className={cn('mt-2', cardStyles.base, 'bg-muted/50 p-3')}>
                    <p className={cn(bodyText.xs, 'leading-relaxed text-muted-foreground')}>
                        {article.summary}
                    </p>
                </div>
            </details>
        </div>
    );
}

function ExtractionMethodBadge({ method }: { method: ExtractionMethod }) {
    const config = {
        html: { icon: Zap, label: 'HTML Scraping', desc: 'Snel (statische HTML)' },
        browser: { icon: Globe, label: 'Browser Scraping', desc: 'JavaScript-rendered content' },
        rss: { icon: Rss, label: 'RSS Feed', desc: 'RSS samenvatting' },
    };

    const { icon: Icon, label, desc } = config[method];

    return (
        <div className={extractionBadgeVariants({ method })}>
            <Icon className="h-4 w-4" />
            <div className="flex flex-col">
                <span>{label}</span>
                <span className="text-[10px] opacity-75">{desc}</span>
            </div>
        </div>
    );
}

interface ChatViewProps {
    chatMessages: ChatMessage[];
    chatInput: string;
    setChatInput: (value: string) => void;
    isSendingChat: boolean;
    chatError: string;
    onSendChat: () => void;
    article: Article;
    characterCount: number;
    chatEndRef: React.RefObject<HTMLDivElement>;
}

function ChatView({
    chatMessages,
    chatInput,
    setChatInput,
    isSendingChat,
    chatError,
    onSendChat,
    article,
    characterCount,
    chatEndRef,
}: ChatViewProps) {
    const suggestions = [
        { emoji: '💬', text: 'Wat is de hoofdboodschap van dit artikel?' },
        { emoji: '👥', text: 'Welke belangrijke personen worden genoemd?' },
        { emoji: '😊', text: 'Wat is het sentiment van dit artikel?' },
        { emoji: '📝', text: 'Geef een samenvatting in 3 punten' },
    ];

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className={cn('flex-1 overflow-y-auto', spacing.md, 'p-4 bg-muted/20 rounded-lg')}>
                {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Chat met AI over dit artikel</h3>
                        <p className={cn(bodyText.small, 'text-muted-foreground max-w-md mb-4')}>
                            De AI heeft volledige toegang tot de artikel content. Stel gerust vragen!
                        </p>
                        <div className={cn('grid grid-cols-1', gap.sm, 'max-w-md')}>
                            {suggestions.map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setChatInput(suggestion.text)}
                                    className={suggestionButtonVariants()}
                                >
                                    {suggestion.emoji} {suggestion.text}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {chatMessages.map((message, index) => (
                            <div
                                key={index}
                                className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
                            >
                                <div className={chatMessageVariants({ role: message.role })}>
                                    <div className={cn('flex items-start', gap.sm)}>
                                        {message.role === 'assistant' && <MessageSquare className="h-4 w-4 mt-0.5 shrink-0" />}
                                        <div className="flex-1">
                                            <p className={cn(bodyText.small, 'whitespace-pre-wrap break-words')}>{message.content}</p>
                                            {message.timestamp && (
                                                <p className={cn(bodyText.xs, 'opacity-70 mt-1')}>
                                                    {new Date(message.timestamp).toLocaleTimeString('nl-NL', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </>
                )}
            </div>

            {chatError && (
                <div className={cn('mt-2 p-2 rounded-md', stateBannerVariants({ state: 'error' }))}>
                    <p className={bodyText.xs}>{chatError}</p>
                </div>
            )}

            <div className={cn('mt-3 flex', gap.sm)}>
                <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            onSendChat();
                        }
                    }}
                    placeholder="Stel een vraag over dit artikel..."
                    disabled={isSendingChat}
                    className={cn(
                        'flex-1 px-3 py-2 rounded-lg border bg-background',
                        'focus:outline-none focus:ring-2 focus:ring-primary',
                        'disabled:opacity-50',
                        transitions.colors
                    )}
                />
                <Button onClick={onSendChat} disabled={!chatInput.trim() || isSendingChat} size="sm" className="px-4">
                    {isSendingChat ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </div>

            <div className={cn('mt-2 p-2 rounded-md bg-muted/30', bodyText.xs, 'text-muted-foreground')}>
                <div className={cn(flexPatterns.start, gap.sm)}>
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span>
                        AI heeft toegang tot: <strong>{article.title}</strong> ({characterCount.toLocaleString('nl-NL')}{' '}
                        karakters)
                    </span>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { ContentScrapingModalProps, ScrapingState, ExtractionMethod, ViewMode };
export {
    stateBannerVariants,
    viewModeButtonVariants,
    extractionBadgeVariants,
    chatMessageVariants,
    suggestionButtonVariants,
};