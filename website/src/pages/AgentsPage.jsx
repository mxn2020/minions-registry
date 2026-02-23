import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSkills } from '../App';

export default function AgentsPage() {
    const data = useSkills();
    const [query, setQuery] = useState('');

    if (!data || !data.agents) {
        return (
            <div className="page-container">
                <div className="hero">
                    <div className="hero-badge">⏳ Loading...</div>
                </div>
            </div>
        );
    }

    const { agents } = data;

    const filtered = useMemo(() => {
        if (!query.trim()) return agents;
        const lowerQuery = query.toLowerCase();
        return agents.filter(agent => {
            return (
                agent.name.toLowerCase().includes(lowerQuery) ||
                (agent.personality.identity && agent.personality.identity.toLowerCase().includes(lowerQuery)) ||
                (agent.personality.soul && agent.personality.soul.toLowerCase().includes(lowerQuery))
            );
        });
    }, [agents, query]);

    return (
        <div className="page-container">
            <div className="breadcrumb">
                <Link to="/">Home</Link>
                <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-current">AI Agents</span>
            </div>

            <div className="all-skills-header animate-in">
                <h1>AI Agents</h1>
                <p className="category-header-count">
                    {filtered.length} of {agents.length} autonomous agents
                </p>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '600px' }}>
                    AI Agents are pre-configured combinations of toolboxes mapped to an overarching personality, including habits, identity, soul, and allergies.
                </p>
            </div>

            <div className="search-container animate-in animate-in-delay-1" style={{ marginBottom: 40, marginLeft: 0 }}>
                <div className="search-wrapper">
                    <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z" />
                    </svg>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Filter agents by name, identity, or soul..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                </div>
            </div>

            {filtered.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">🤖</div>
                    <h3>No agents match "{query}"</h3>
                    <p>Try a different search term</p>
                </div>
            )}

            <div className="skills-grid animate-in animate-in-delay-2">
                {filtered.map(agent => (
                    <Link to={`/agent/${agent.slug}`} key={agent.slug} className="skill-card">
                        <div className="skill-card-header">
                            <div className="skill-card-name">{agent.name}</div>
                            <div className="skill-card-id" style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-purple)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                                {agent.toolboxes.length} Toolboxes
                            </div>
                        </div>
                        <div className="skill-card-desc">
                            {/* Extract the first sentence or so of the identity */}
                            {agent.personality.identity
                                ? agent.personality.identity.substring(agent.personality.identity.indexOf('\\n') + 1).replace(/#/g, '').trim().split('.')[0] + '.'
                                : 'A specialized autonomous agent.'}
                        </div>
                        <div className="skill-card-footer">
                            {agent.personality.habits && (
                                <span className="skill-chip">🧠 Habits Defined</span>
                            )}
                            {agent.personality.allergies && (
                                <span className="skill-chip">🛡️ Allergies Defined</span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
