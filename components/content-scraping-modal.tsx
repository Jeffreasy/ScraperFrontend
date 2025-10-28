'use client';

import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, FileText, CheckCircle, XCircle, Download, MessageSquare, Send } from 'lucide-react';
import { Article, ChatMessage, ChatResponse } from '@/lib/types/api';
import { apiClient } from '@/lib/api/client';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils';

interface ContentScrapingModalProps {
    article: Article;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type ScrapingState = 'idle' | 'loading' | 'success' | 'error';
type ExtractionMethod = 'html' | 'browser' | 'rss';
type ViewMode = 'content' | 'chat';

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
    const [characterCount, setCharacterCount] = useState<number>(
        article.content?.length || 0
    );
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

                // Fetch the updated article to get the content
                const articleResponse = await apiClient.getArticle(article.id);

                if (articleResponse.success && articleResponse.data?.content) {
                    setScrapedContent(articleResponse.data.content);
                    setState('success');

                    // Invalidate queries to update UI
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

    const resetModal = () => {
        setState('idle');
        setScrapedContent('');
        setCharacterCount(0);
        setExtractionMethod(undefined);
        setExtractionTimeMs(undefined);
        setError('');
    };

    const handleSendChat = async () => {
        if (!chatInput.trim() || isSendingChat) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: chatInput.trim(),
            timestamp: new Date().toISOString(),
        };

        setChatMessages(prev => [...prev, userMessage]);
        setChatInput('');
        setIsSendingChat(true);
        setChatError('');

        try {
            // Build article content string with metadata
            const contentToUse = scrapedContent || article.content || article.summary;
            const articleContentString = `Titel: ${article.title}
Bron: ${article.source}
URL: ${article.url}
Gepubliceerd: ${article.published}

VOLLEDIGE ARTIKEL TEKST:
${contentToUse}`;

            console.log('[Chat] Sending message with article context:', {
                articleId: article.id,
                articleTitle: article.title,
                contentLength: contentToUse.length,
                messageLength: userMessage.content.length,
            });

            const response = await apiClient.sendChatMessage({
                message: userMessage.content,  // Alleen de vraag (max 1000 chars)
                article_content: articleContentString,  // Volledige content apart (geen limiet)
                article_id: article.id,
            });

            if (response.success && response.data) {
                const assistantMessage: ChatMessage = {
                    role: 'assistant',
                    content: response.data.message,
                    timestamp: new Date().toISOString(),
                };
                setChatMessages(prev => [...prev, assistantMessage]);
                console.log('[Chat] Received response');
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

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const getExtractionMethodBadge = () => {
        if (!extractionMethod) return null;

        const badges = {
            html: {
                icon: '⚡',
                label: 'HTML Scraping',
                color: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
                description: 'Snel (statische HTML)'
            },
            browser: {
                icon: '🌐',
                label: 'Browser Scraping',
                color: 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800',
                description: 'JavaScript-rendered content'
            },
            rss: {
                icon: '📰',
                label: 'RSS Feed',
                color: 'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
                description: 'RSS samenvatting'
            }
        };

        const badge = badges[extractionMethod];
        return (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium ${badge.color}`}>
                <span className="text-sm">{badge.icon}</span>
                <div className="flex flex-col">
                    <span>{badge.label}</span>
                    <span className="text-[10px] opacity-75">{badge.description}</span>
                </div>
            </div>
        );
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                onOpenChange(isOpen);
                // Only reset if scraping failed, not if we have content
                if (!isOpen && state !== 'success') {
                    resetModal();
                }
            }}
        >
            <DialogContent className="max-w-5xl h-[85vh] flex flex-col overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        HTML Content Scraping
                    </DialogTitle>
                    <DialogDescription className="text-left">
                        <span className="font-medium">{article.title}</span>
                    </DialogDescription>
                </DialogHeader>

                {/* View Mode Toggle */}
                {state === 'success' && scrapedContent && (
                    <div className="flex gap-2 border-b pb-2">
                        <button
                            onClick={() => setViewMode('content')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'content'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                                }`}
                        >
                            <FileText className="h-4 w-4" />
                            <span className="font-medium">Content</span>
                        </button>
                        <button
                            onClick={() => setViewMode('chat')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'chat'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                                }`}
                        >
                            <MessageSquare className="h-4 w-4" />
                            <span className="font-medium">Chat met AI</span>
                            {chatMessages.length > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 text-xs bg-background/20 rounded">
                                    {chatMessages.length}
                                </span>
                            )}
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto flex flex-col gap-4">
                    {/* Article Info */}
                    <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Bron:</span>
                            <span className="font-medium">{article.source}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Gepubliceerd:</span>
                            <span className="font-medium">{formatRelativeTime(article.published)}</span>
                        </div>
                        {article.content_extracted && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Content status:</span>
                                <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                                    <CheckCircle className="h-3 w-3" />
                                    Al gescraped
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Idle State - Show Summary as Fallback */}
                    {state === 'idle' && (
                        <div className="flex-1 flex flex-col py-4 overflow-y-auto">
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-muted-foreground">
                                        RSS Samenvatting (Altijd beschikbaar)
                                    </h3>
                                    <span className="text-xs text-muted-foreground">
                                        {article.summary.length} karakters
                                    </span>
                                </div>
                                <div className="rounded-lg border bg-card p-4">
                                    <p className="text-sm leading-relaxed">{article.summary}</p>
                                </div>
                            </div>

                            <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-6 text-center">
                                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                <h4 className="text-base font-semibold mb-2">Volledige artikel tekst ophalen?</h4>
                                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                                    Probeer de volledige HTML content van dit artikel op te halen.
                                    <br />
                                    <span className="text-xs">⚠️ Werkt niet altijd (afhankelijk van website)</span>
                                </p>
                                <Button onClick={handleScrape} size="lg">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Probeer Volledige Tekst Op Te Halen
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {state === 'loading' && (
                        <div className="flex-1 flex flex-col items-center justify-center py-8">
                            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Content aan het ophalen...</h3>
                            <p className="text-sm text-muted-foreground">
                                Even geduld, dit kan enkele seconden duren
                            </p>
                        </div>
                    )}

                    {/* Error State - Show Summary as Fallback */}
                    {state === 'error' && (
                        <div className="flex-1 flex flex-col py-4 overflow-y-auto">
                            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-destructive mb-1">
                                            Volledige tekst ophalen mislukt
                                        </h4>
                                        <p className="text-xs text-destructive/90 mb-2">
                                            {error}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Dit kan gebeuren door anti-scraping maatregelen, paywalls, of JavaScript-only content.
                                            De RSS samenvatting blijft beschikbaar hieronder.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <Button onClick={handleScrape} variant="outline" size="sm">
                                        Opnieuw proberen
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-muted-foreground">
                                        RSS Samenvatting (Fallback)
                                    </h3>
                                    <span className="text-xs text-muted-foreground">
                                        {article.summary.length} karakters
                                    </span>
                                </div>
                                <div className="rounded-lg border bg-card p-4">
                                    <p className="text-sm leading-relaxed">{article.summary}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success State - Show Full Content or Chat */}
                    {state === 'success' && scrapedContent && viewMode === 'content' && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="rounded-lg border border-green-500/50 bg-green-50 dark:bg-green-950/30 p-3 mb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        <span className="font-medium text-green-900 dark:text-green-100">
                                            Volledige tekst succesvol opgehaald
                                        </span>
                                        <span className="text-xs text-green-700 dark:text-green-300">
                                            ({characterCount.toLocaleString('nl-NL')} karakters)
                                        </span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDownload}
                                        className="h-7"
                                    >
                                        <Download className="h-3 w-3 mr-1" />
                                        Download
                                    </Button>
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                    {getExtractionMethodBadge()}
                                    {extractionTimeMs && (
                                        <span className="text-xs text-muted-foreground">
                                            ⏱️ {(extractionTimeMs / 1000).toFixed(2)}s
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto rounded-lg border bg-card p-4">
                                <div className="w-full">
                                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                        {scrapedContent}
                                    </p>
                                </div>
                            </div>

                            {/* Show summary for comparison */}
                            <details className="mt-3">
                                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                                    Toon originele RSS samenvatting
                                </summary>
                                <div className="mt-2 rounded-lg border bg-muted/50 p-3">
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        {article.summary}
                                    </p>
                                </div>
                            </details>
                        </div>
                    )}

                    {/* Chat View */}
                    {state === 'success' && scrapedContent && viewMode === 'chat' && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-muted/20 rounded-lg">
                                {chatMessages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                        <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">Chat met AI over dit artikel</h3>
                                        <p className="text-sm text-muted-foreground max-w-md mb-4">
                                            De AI heeft volledige toegang tot de artikel content. Stel gerust vragen!
                                        </p>
                                        <div className="grid grid-cols-1 gap-2 max-w-md">
                                            <button
                                                onClick={() => setChatInput('Wat is de hoofdboodschap van dit artikel?')}
                                                className="px-3 py-2 text-xs text-left bg-muted hover:bg-muted/80 rounded-md transition-colors"
                                            >
                                                💬 Wat is de hoofdboodschap van dit artikel?
                                            </button>
                                            <button
                                                onClick={() => setChatInput('Welke belangrijke personen worden genoemd?')}
                                                className="px-3 py-2 text-xs text-left bg-muted hover:bg-muted/80 rounded-md transition-colors"
                                            >
                                                👥 Welke belangrijke personen worden genoemd?
                                            </button>
                                            <button
                                                onClick={() => setChatInput('Wat is het sentiment van dit artikel?')}
                                                className="px-3 py-2 text-xs text-left bg-muted hover:bg-muted/80 rounded-md transition-colors"
                                            >
                                                😊 Wat is het sentiment van dit artikel?
                                            </button>
                                            <button
                                                onClick={() => setChatInput('Geef een samenvatting in 3 punten')}
                                                className="px-3 py-2 text-xs text-left bg-muted hover:bg-muted/80 rounded-md transition-colors"
                                            >
                                                📝 Geef een samenvatting in 3 punten
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {chatMessages.map((message, index) => (
                                            <div
                                                key={index}
                                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-card border'
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        {message.role === 'assistant' && (
                                                            <MessageSquare className="h-4 w-4 mt-0.5 shrink-0" />
                                                        )}
                                                        <div className="flex-1">
                                                            <p className="text-sm whitespace-pre-wrap break-words">
                                                                {message.content}
                                                            </p>
                                                            {message.timestamp && (
                                                                <p className="text-xs opacity-70 mt-1">
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

                            {/* Chat Error */}
                            {chatError && (
                                <div className="mt-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                                    <p className="text-xs text-destructive">{chatError}</p>
                                </div>
                            )}

                            {/* Chat Input */}
                            <div className="mt-3 flex gap-2">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendChat();
                                        }
                                    }}
                                    placeholder="Stel een vraag over dit artikel..."
                                    disabled={isSendingChat}
                                    className="flex-1 px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                />
                                <Button
                                    onClick={handleSendChat}
                                    disabled={!chatInput.trim() || isSendingChat}
                                    size="sm"
                                    className="px-4"
                                >
                                    {isSendingChat ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>

                            {/* Article Context Info */}
                            <div className="mt-2 p-2 rounded-md bg-muted/30 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                    <span>
                                        AI heeft toegang tot: <strong>{article.title}</strong> ({characterCount.toLocaleString('nl-NL')} karakters)
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}