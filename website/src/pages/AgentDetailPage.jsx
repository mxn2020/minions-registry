import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSkills } from '../App';

export default function AgentDetailPage() {
    const params = useParams();
    const slug = params.slug;
    const data = useSkills();
    const [activeTab, setActiveTab] = useState('identity');

    if (!data || !data.agents) {
        return (
            <div className="page-container">
                <div className="hero">
                    <div className="hero-badge">⏳ Loading...</div>
                </div>
            </div>
        );
    }

    const agent = data.agents.find(a => a.slug === slug);

    if (!agent) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    <div className="empty-state-icon">🤖</div>
                    <h3>Agent not found</h3>
                    <p>Could not find an AI Agent with slug: {slug}</p>
                    <Link to="/agents" className="back-link">← Back to Agents</Link>
                </div>
            </div>
        );
    }

    const { personality, toolboxes } = agent;

    const tabs = [
        { id: 'identity', label: 'Identity', content: personality.identity },
        { id: 'soul', label: 'Soul', content: personality.soul },
        { id: 'habits', label: 'Habits', content: personality.habits },
        { id: 'allergies', label: 'Allergies', content: personality.allergies },
        { id: 'skills', label: 'Soft Skills', content: personality.skills },
    ].filter(t => t.content);

    // Ensure activeTab is valid
    if (tabs.length > 0 && !tabs.find(t => t.id === activeTab)) {
        setActiveTab(tabs[0].id);
    }

    const activeContent = tabs.find(t => t.id === activeTab)?.content;

    return (
        <div className="page-container">
            {/* Breadcrumb */}
            <div className="breadcrumb">
                <Link to="/">Home</Link>
                <span className="breadcrumb-sep">/</span>
                <Link to="/agents">AI Agents</Link>
                <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-current">{agent.name}</span>
            </div>

            {/* Detail Header */}
            <div className="skill-detail animate-in">
                <div className="skill-detail-header">
                    <div className="skill-detail-meta">
                        <span className="badge badge-id" style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-purple)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                            🤖 AI Agent
                        </span>
                        <span className="badge badge-version" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                            {toolboxes.length} Toolboxes
                        </span>
                    </div>
                    <h1>{agent.name}</h1>

                    <a
                        href={`https://github.com/mxn2020/minions-registry/tree/main/minions-agents/${agent.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="skill-detail-source"
                    >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                        </svg>
                        View Agent on GitHub
                    </a>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Tabs */}
                        {tabs.length > 0 && (
                            <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-medium)', paddingBottom: '12px', overflowX: 'auto' }}>
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '100px',
                                            border: 'none',
                                            background: activeTab === tab.id ? 'var(--accent-purple)' : 'transparent',
                                            color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                                            fontWeight: activeTab === tab.id ? 600 : 400,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Active Tab Content */}
                        {activeContent && (
                            <div className="markdown-body animate-in" style={{ padding: '24px' }}>
                                <Markdown remarkPlugins={[remarkGfm]}>{activeContent}</Markdown>
                            </div>
                        )}
                    </div>

                    <div className="markdown-body animate-in animate-in-delay-2" style={{ padding: '24px', height: 'fit-content' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>🔧 Configured Toolboxes</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>This agent has been pre-configured with the following technical toolboxes:</p>
                        <ul style={{ listStyleType: 'none', padding: 0, margin: '16px 0 0 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {toolboxes.map(tb => {
                                // Find toolbox mapping path
                                let tbPath = null;
                                for (const cat of data.categories) {
                                    for (const skill of cat.skills) {
                                        if (skill.slug === tb) tbPath = skill.path;
                                    }
                                    for (const sc of cat.subcategories) {
                                        for (const skill of sc.skills) {
                                            if (skill.slug === tb) tbPath = skill.path;
                                        }
                                    }
                                }

                                return (
                                    <li key={tb}>
                                        <Link
                                            to={tbPath ? `/skill/${tbPath}` : '#'}
                                            style={{ display: 'block', textDecoration: 'none' }}
                                        >
                                            <span className="skill-chip command" style={{ width: '100%', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                                                {tb}
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
