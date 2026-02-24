import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSkills } from '../App';

export default function BundlesPage() {
    const data = useSkills();
    const [query, setQuery] = useState('');

    if (!data || !data.bundles) {
        return (
            <div className="page-container">
                <div className="hero">
                    <div className="hero-badge">⏳ Loading...</div>
                </div>
            </div>
        );
    }

    const { bundles } = data;

    const filtered = useMemo(() => {
        if (!query.trim()) return bundles;
        const lowerQuery = query.toLowerCase();
        return bundles.filter(bundle => {
            return (
                bundle.name.toLowerCase().includes(lowerQuery) ||
                (bundle.description && bundle.description.toLowerCase().includes(lowerQuery)) ||
                (bundle.skills && bundle.skills.toLowerCase().includes(lowerQuery))
            );
        });
    }, [bundles, query]);

    return (
        <div className="page-container">
            <div className="breadcrumb">
                <Link to="/">Home</Link>
                <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-current">Bundles</span>
            </div>

            <div className="all-skills-header animate-in">
                <h1>Bundles</h1>
                <p className="category-header-count">
                    {filtered.length} of {bundles.length} bundles
                </p>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '600px' }}>
                    Bundles are curated assemblies of MinionTypes, relations, and views designed for a specific domain, complete with contextual agent skills.
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
                        placeholder="Filter bundles by name, description, or skills..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                </div>
            </div>

            {filtered.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <h3>No bundles match "{query}"</h3>
                    <p>Try a different search term</p>
                </div>
            )}

            <div className="skills-grid animate-in animate-in-delay-2">
                {filtered.map(bundle => (
                    <a href={`https://github.com/mxn2020/${bundle.name}`} target="_blank" rel="noopener noreferrer" key={bundle.slug} className="skill-card">
                        <div className="skill-card-header">
                            <div className="skill-card-name" style={{ color: "var(--accent-purple)", fontSize: "1.2rem", fontWeight: "600" }}>{bundle.name}</div>
                            <div className="skill-card-id" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                v{bundle.version}
                            </div>
                        </div>
                        <div className="skill-card-desc">
                            {bundle.description || 'A unified Minions bundle layer.'}
                        </div>
                        <div className="skill-card-footer">
                            <span className="skill-chip">📦 Models</span>
                            <span className="skill-chip">🔗 Relations</span>
                            <span className="skill-chip">🧠 Skills</span>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
