import { Link } from 'react-router-dom';
import { useSkills } from '../App';
import SearchBar from '../components/SearchBar';

export default function HomePage() {
    const data = useSkills();

    if (!data) {
        return (
            <div className="page-container">
                <div className="hero">
                    <div className="hero-badge">⏳ Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Hero */}
            <section className="hero animate-in">
                <div className="hero-badge">🚀 Minion Toolboxes</div>
                <h1>
                    The Minions
                </h1>
                <h1>
                    <span className="gradient-text">Ecosystem Registry</span>
                </h1>
                <p className="hero-subtitle">
                    Discover reusable toolboxes built on the Minions object system. A curated directory of {data.totalSkills} production-ready toolboxes for AI agents.
                    Browse, search, and integrate — powerup your agents.
                </p>
                <SearchBar />
                <div className="hero-stats">
                    <div className="hero-stat">
                        <div className="hero-stat-value">{data.totalAgents || 0}</div>
                        <div className="hero-stat-label">AI Agents</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-value">{data.totalSkills}</div>
                        <div className="hero-stat-label">Toolboxes</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-value">{data.categories.length}</div>
                        <div className="hero-stat-label">Categories</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-value">OSS</div>
                        <div className="hero-stat-label">License</div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="animate-in animate-in-delay-2">
                <h2 className="section-title">Browse by Category</h2>
                <p className="section-subtitle">
                    Explore toolboxes organized by domain and use case
                </p>
                <div className="categories-grid">
                    {data.categories.map((cat, i) => (
                        <Link
                            to={`/category/${cat.slug}`}
                            key={cat.slug}
                            className={`category-card animate-in animate-in-delay-${Math.min(i + 1, 6)}`}
                        >
                            <div className="category-card-icon">{cat.icon}</div>
                            <div className="category-card-name">{cat.name}</div>
                            <div className="category-card-count">
                                {cat.skillCount} toolbox{cat.skillCount !== 1 ? 'es' : ''}
                                {cat.subcategories.length > 0 &&
                                    ` · ${cat.subcategories.length} subcategories`}
                            </div>
                            <span className="category-card-arrow">→</span>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
