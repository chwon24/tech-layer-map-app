import { useState, useMemo, useEffect, useCallback } from "react";

const GITHUB_SEARCH_URL = "https://api.github.com/search/repositories";

const techSearchKeyword = {
  "AWS": "aws-sdk", "GCP": "google-cloud", "Azure": "azure-sdk",
  "Docker": "docker", "Kubernetes": "kubernetes", "Linux": "linux",
  "Kafka": "apache-kafka", "Airflow": "apache-airflow", "Scrapy": "scrapy",
  "API 연동": "rest-api", "Logstash": "logstash", "PostgreSQL": "postgresql",
  "MySQL": "mysql", "MongoDB": "mongodb", "Redis": "redis",
  "Snowflake": "snowflake-connector", "S3": "aws-s3", "Pandas": "pandas",
  "Spark": "apache-spark", "dbt": "dbt-core", "Hadoop": "hadoop",
  "Streamlit": "streamlit", "Tableau": "tableau-api-lib", "Grafana": "grafana",
  "REST API": "fastapi", "GraphQL": "graphql-js", "Scikit-learn": "scikit-learn",
  "TensorFlow": "tensorflow", "PyTorch": "pytorch", "LangChain": "langchain",
  "OpenAI API": "openai-python",
};

function getTrendBadge(stars) {
  if (stars >= 50000) return { label: "🔥 Hot", color: "#ef4444" };
  if (stars >= 10000) return { label: "📈 Rising", color: "#f59e0b" };
  return { label: "➖ Stable", color: "#475569" };
}

async function fetchTrend(techName) {
  const keyword = techSearchKeyword[techName] || techName.toLowerCase();
  try {
    const res = await fetch(`${GITHUB_SEARCH_URL}?q=${encodeURIComponent(keyword)}&sort=stars&per_page=1`);
    if (!res.ok) return null;
    const data = await res.json();
    const top = data.items?.[0];
    if (!top) return null;
    return {
      stars: top.stargazers_count,
      badge: getTrendBadge(top.stargazers_count),
      repoName: top.full_name,
      url: top.html_url,
    };
  } catch { return null; }
}

const layers = [
  {
    id: "infra",
    name: "Infrastructure",
    nameKo: "인프라",
    description: "모든 서비스가 돌아가는 기반 환경",
    subdesc: "서버, 네트워크, 컨테이너 관리",
    accent: "#4f46e5",
    techs: [
      { name: "AWS", desc: "아마존의 클라우드 플랫폼. 가장 널리 쓰이는 인프라 서비스", related: ["Docker", "Kubernetes", "S3"] },
      { name: "GCP", desc: "구글 클라우드 플랫폼. AI/ML에 강점", related: ["Kubernetes", "TensorFlow", "Kafka"] },
      { name: "Azure", desc: "마이크로소프트 클라우드. 기업 환경에 강점", related: ["Docker", "PostgreSQL"] },
      { name: "Docker", desc: "컨테이너 기술. 앱을 어디서나 동일하게 실행", related: ["Kubernetes", "Airflow"] },
      { name: "Kubernetes", desc: "컨테이너 오케스트레이션. 대규모 배포 관리", related: ["Docker", "Kafka", "Airflow"] },
      { name: "Linux", desc: "서버 운영체제의 표준", related: ["AWS", "Docker"] },
    ],
  },
  {
    id: "ingestion",
    name: "Ingestion",
    nameKo: "데이터 수집",
    description: "외부 소스에서 데이터를 가져오는 레이어",
    subdesc: "실시간 / 배치 수집",
    accent: "#0ea5e9",
    techs: [
      { name: "Kafka", desc: "대용량 실시간 데이터 스트리밍 플랫폼", related: ["Spark", "Airflow", "PostgreSQL"] },
      { name: "Airflow", desc: "데이터 파이프라인 워크플로우 스케줄러", related: ["Kafka", "dbt", "Snowflake"] },
      { name: "Scrapy", desc: "Python 기반 웹 크롤링 프레임워크", related: ["MongoDB", "Pandas"] },
      { name: "API 연동", desc: "REST/GraphQL API를 통한 외부 데이터 수집", related: ["REST API", "MongoDB"] },
      { name: "Logstash", desc: "로그 데이터 수집 및 전처리 도구", related: ["Kafka", "Grafana"] },
    ],
  },
  {
    id: "storage",
    name: "Storage",
    nameKo: "데이터 저장",
    description: "수집된 데이터를 저장하는 레이어",
    subdesc: "목적에 따라 DB 종류가 달라짐",
    accent: "#06b6d4",
    techs: [
      { name: "PostgreSQL", desc: "관계형 DB의 표준. 복잡한 쿼리에 강점", related: ["dbt", "Airflow", "Grafana"] },
      { name: "MySQL", desc: "가장 널리 쓰이는 오픈소스 관계형 DB", related: ["Pandas", "dbt"] },
      { name: "MongoDB", desc: "유연한 구조의 NoSQL 문서 DB", related: ["Scrapy", "Pandas"] },
      { name: "Redis", desc: "초고속 인메모리 캐시 DB", related: ["Kafka", "REST API"] },
      { name: "Snowflake", desc: "클라우드 기반 데이터 웨어하우스", related: ["dbt", "Airflow", "Tableau"] },
      { name: "S3", desc: "AWS의 대용량 객체 스토리지", related: ["AWS", "Spark", "Airflow"] },
    ],
  },
  {
    id: "processing",
    name: "Processing",
    nameKo: "데이터 처리/분석",
    description: "저장된 데이터를 정제하고 분석 가능한 형태로 변환",
    subdesc: "ETL, 집계, 정제",
    accent: "#10b981",
    techs: [
      { name: "Pandas", desc: "Python 데이터 분석의 표준 라이브러리", related: ["Scikit-learn", "Streamlit", "PostgreSQL"] },
      { name: "Spark", desc: "대용량 분산 데이터 처리 엔진", related: ["Kafka", "S3", "Snowflake"] },
      { name: "dbt", desc: "SQL 기반 데이터 변환 도구", related: ["Snowflake", "PostgreSQL", "Airflow"] },
      { name: "Hadoop", desc: "분산 저장 및 처리 프레임워크", related: ["Spark", "S3"] },
    ],
  },
  {
    id: "serving",
    name: "Serving",
    nameKo: "시각화/서비스",
    description: "분석 결과를 사람이 볼 수 있게 보여주거나 다른 서비스에 제공",
    subdesc: "대시보드, API, 리포트",
    accent: "#f59e0b",
    techs: [
      { name: "Streamlit", desc: "Python으로 빠르게 만드는 데이터 앱", related: ["Pandas", "Scikit-learn"] },
      { name: "Tableau", desc: "비개발자도 쓸 수 있는 BI 시각화 도구", related: ["Snowflake", "PostgreSQL"] },
      { name: "Grafana", desc: "실시간 모니터링 대시보드", related: ["PostgreSQL", "Logstash", "Redis"] },
      { name: "REST API", desc: "HTTP 기반 데이터 제공 인터페이스", related: ["API 연동", "Redis", "PostgreSQL"] },
      { name: "GraphQL", desc: "유연한 쿼리 기반 API 표준", related: ["REST API", "MongoDB"] },
    ],
  },
  {
    id: "aiml",
    name: "AI / ML",
    nameKo: "AI / ML",
    description: "데이터를 기반으로 예측, 추천, 자동화 모델을 만들고 서빙",
    subdesc: "모델 학습, 추론, 배포",
    accent: "#a855f7",
    techs: [
      { name: "Scikit-learn", desc: "Python ML의 시작점. 전통적 ML 알고리즘", related: ["Pandas", "Streamlit"] },
      { name: "TensorFlow", desc: "구글의 딥러닝 프레임워크", related: ["GCP", "Pandas"] },
      { name: "PyTorch", desc: "Meta의 딥러닝 프레임워크. 연구에 인기", related: ["Pandas", "S3"] },
      { name: "LangChain", desc: "LLM 기반 앱 개발 프레임워크", related: ["OpenAI API", "MongoDB", "REST API"] },
      { name: "OpenAI API", desc: "GPT 등 OpenAI 모델을 API로 활용", related: ["LangChain", "REST API"] },
    ],
  },
];

const techLayerMap = {};
layers.forEach(layer => {
  layer.techs.forEach(tech => { techLayerMap[tech.name] = layer.accent; });
});

export default function TechLayerMap() {
  const [selectedTech, setSelectedTech] = useState(null);
  const [hoveredLayer, setHoveredLayer] = useState(null);
  const [expandedLayer, setExpandedLayer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [liked, setLiked] = useState({});
  const [showFavorites, setShowFavorites] = useState(false);
  const [trendData, setTrendData] = useState({});
  const [trendLoading, setTrendLoading] = useState({});

  // 레이어 열릴 때 해당 레이어 기술들의 트렌드 fetch
  const fetchLayerTrends = useCallback(async (layerId) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    const toFetch = layer.techs.filter(t => !trendData[t.name] && !trendLoading[t.name]);
    if (toFetch.length === 0) return;

    setTrendLoading(prev => {
      const next = { ...prev };
      toFetch.forEach(t => { next[t.name] = true; });
      return next;
    });

    await Promise.all(toFetch.map(async (tech) => {
      const result = await fetchTrend(tech.name);
      setTrendData(prev => ({ ...prev, [tech.name]: result || "error" }));
      setTrendLoading(prev => ({ ...prev, [tech.name]: false }));
    }));
  }, [trendData, trendLoading]);

  useEffect(() => {
    if (expandedLayer) fetchLayerTrends(expandedLayer);
  }, [expandedLayer]);

  const likedTechs = useMemo(() => {
    const result = [];
    layers.forEach(layer => {
      layer.techs.forEach(tech => {
        if (liked[tech.name]) result.push({ ...tech, layerAccent: layer.accent, layerName: layer.nameKo });
      });
    });
    return result;
  }, [liked]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results = [];
    layers.forEach(layer => {
      layer.techs.forEach(tech => {
        if (tech.name.toLowerCase().includes(q) || tech.desc.toLowerCase().includes(q))
          results.push({ ...tech, layerAccent: layer.accent, layerName: layer.nameKo });
      });
    });
    return results;
  }, [searchQuery]);

  const handleTechClick = (tech, layer) => {
    if (selectedTech?.name === tech.name) setSelectedTech(null);
    else setSelectedTech({ ...tech, layerAccent: layer.accent, layerName: layer.nameKo });
  };

  const toggleLike = (e, techName) => {
    e.stopPropagation();
    setLiked(prev => ({ ...prev, [techName]: !prev[techName] }));
  };

  const isRelated = (techName) => selectedTech && selectedTech.related?.includes(techName) && selectedTech.name !== techName;
  const isSearchHit = (techName) => searchQuery.trim() && searchResults.some(t => t.name === techName);

  return (
    <div style={{ minHeight: "100vh", background: "#070b14", fontFamily: "'Courier New', monospace", padding: "40px 24px", color: "#e2e8f0" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "4px", color: "#4f46e5", marginBottom: "12px" }}>DATA & SOFTWARE ENGINEERING</div>
        <h1 style={{
          fontSize: "clamp(28px, 5vw, 48px)", fontWeight: "800", margin: "0 0 12px",
          background: "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-1px",
        }}>Tech Layer Map</h1>
        <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>기술 스택의 레이어 구조를 한눈에 · 기술을 클릭하면 연관 기술이 표시돼요</p>
      </div>

      {/* Search + Favorites */}
      <div style={{ maxWidth: "900px", margin: "0 auto 16px", display: "flex", gap: "10px" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#334155", fontSize: "12px" }}>🔍</span>
          <input
            type="text"
            placeholder="기술 검색... (예: Kafka, PyTorch)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: "100%", padding: "10px 32px 10px 34px", background: "#0d1117",
              border: "1px solid #1e293b", borderRadius: "4px", color: "#e2e8f0",
              fontSize: "12px", fontFamily: "'Courier New', monospace", outline: "none", boxSizing: "border-box",
            }}
          />
          {searchQuery && (
            <span onClick={() => setSearchQuery("")} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#475569", cursor: "pointer", fontSize: "11px" }}>✕</span>
          )}
        </div>
        <button
          onClick={() => setShowFavorites(!showFavorites)}
          style={{
            padding: "10px 16px", background: showFavorites ? "#1a0f2e" : "#0d1117",
            border: `1px solid ${showFavorites ? "#a855f7" : "#1e293b"}`,
            borderRadius: "4px", color: showFavorites ? "#a855f7" : "#475569",
            cursor: "pointer", fontSize: "12px", fontFamily: "'Courier New', monospace", whiteSpace: "nowrap",
          }}
        >
          {liked && Object.values(liked).filter(Boolean).length > 0 ? `♥ (${Object.values(liked).filter(Boolean).length})` : "♡ 좋아요"}
        </button>
      </div>

      {/* Search dropdown */}
      {searchQuery && (
        <div style={{ maxWidth: "900px", margin: "0 auto 12px", background: "#0a0f1a", border: "1px solid #1e293b", borderRadius: "4px", overflow: "hidden" }}>
          {searchResults.length === 0 ? (
            <div style={{ padding: "14px 16px", fontSize: "12px", color: "#334155", textAlign: "center" }}>검색 결과가 없어요</div>
          ) : searchResults.map(tech => (
            <div
              key={tech.name}
              onClick={() => {
                setSelectedTech(tech);
                setSearchQuery("");
                setExpandedLayer(layers.find(l => l.techs.some(t => t.name === tech.name))?.id);
              }}
              style={{ padding: "11px 16px", cursor: "pointer", borderBottom: "1px solid #0d1117", display: "flex", alignItems: "center", gap: "12px" }}
              onMouseEnter={e => e.currentTarget.style.background = "#0d1117"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: "9px", color: tech.layerAccent, minWidth: "70px", letterSpacing: "1px" }}>{tech.layerName}</span>
              <span style={{ fontSize: "12px", color: "#e2e8f0", fontWeight: "700" }}>{tech.name}</span>
              <span style={{ fontSize: "11px", color: "#475569" }}>{tech.desc}</span>
            </div>
          ))}
        </div>
      )}

      {/* Favorites panel */}
      {showFavorites && (
        <div style={{ maxWidth: "900px", margin: "0 auto 16px", padding: "18px 20px", background: "#0a0f1a", border: "1px solid #a855f730", borderLeft: "3px solid #a855f7" }}>
          <div style={{ fontSize: "10px", color: "#a855f7", letterSpacing: "2px", marginBottom: "12px" }}>♥ 좋아요한 기술</div>
          {likedTechs.length === 0 ? (
            <div style={{ fontSize: "12px", color: "#334155" }}>아직 없어요. 기술 카드의 ♡ 버튼을 눌러보세요!</div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {likedTechs.map(tech => (
                <div
                  key={tech.name}
                  onClick={() => { setSelectedTech(tech); setExpandedLayer(layers.find(l => l.techs.some(t => t.name === tech.name))?.id); }}
                  style={{ padding: "7px 12px", background: "#0d1117", border: `1px solid ${tech.layerAccent}50`, borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span style={{ fontSize: "9px", color: tech.layerAccent }}>{tech.layerName}</span>
                  <span style={{ fontSize: "12px", color: "#e2e8f0", fontWeight: "700" }}>{tech.name}</span>
                  <span onClick={e => toggleLike(e, tech.name)} style={{ color: "#a855f7", cursor: "pointer", fontSize: "11px" }}>♥</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Flow indicator */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "16px", fontSize: "11px", color: "#334155", letterSpacing: "2px" }}>
        <span>DATA FLOWS</span><span>↓</span><span>BOTTOM TO TOP</span>
      </div>

      {/* Selected tech detail panel */}
      {selectedTech && (
        <div style={{
          maxWidth: "900px", margin: "0 auto 16px", padding: "20px 24px",
          background: "#0a0f1a", border: `1px solid ${selectedTech.layerAccent}50`, borderLeft: `3px solid ${selectedTech.layerAccent}`,
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "10px", color: selectedTech.layerAccent, letterSpacing: "2px", marginBottom: "6px" }}>{selectedTech.layerName}</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#e2e8f0", marginBottom: "6px" }}>{selectedTech.name}</div>
            <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px" }}>{selectedTech.desc}</div>

            {/* Trend info in detail panel */}
            {trendData[selectedTech.name] && trendData[selectedTech.name] !== "error" && (
              <div style={{ marginBottom: "12px", padding: "10px 14px", background: "#0d1117", border: "1px solid #1e293b", borderRadius: "4px", display: "flex", alignItems: "center", gap: "16px" }}>
                <span style={{ fontSize: "12px", color: trendData[selectedTech.name].badge.color, fontWeight: "700" }}>
                  {trendData[selectedTech.name].badge.label}
                </span>
                <span style={{ fontSize: "11px", color: "#64748b" }}>
                  ★ {trendData[selectedTech.name].stars.toLocaleString()} stars
                </span>
                <a
                  href={trendData[selectedTech.name].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "10px", color: "#334155", textDecoration: "none", marginLeft: "auto" }}
                  onClick={e => e.stopPropagation()}
                >
                  {trendData[selectedTech.name].repoName} →
                </a>
              </div>
            )}
            {selectedTech.related?.length > 0 && (
              <div>
                <div style={{ fontSize: "10px", color: "#334155", letterSpacing: "1px", marginBottom: "8px" }}>연관 기술 — 레이어를 열면 하이라이트돼요</div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {selectedTech.related.map(rel => (
                    <span key={rel} style={{
                      fontSize: "11px", padding: "4px 10px", background: "#0d1117",
                      border: `1px solid ${techLayerMap[rel] || "#1e293b"}60`, borderRadius: "3px", color: techLayerMap[rel] || "#475569",
                    }}>{rel}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={e => toggleLike(e, selectedTech.name)}
              style={{
                background: "none", border: `1px solid ${liked[selectedTech.name] ? "#a855f7" : "#1e293b"}`,
                color: liked[selectedTech.name] ? "#a855f7" : "#475569",
                cursor: "pointer", padding: "6px 12px", fontSize: "14px", borderRadius: "3px",
              }}
            >{liked[selectedTech.name] ? "♥" : "♡"}</button>
            <button
              onClick={() => setSelectedTech(null)}
              style={{ background: "none", border: "1px solid #1e293b", color: "#475569", cursor: "pointer", padding: "6px 12px", fontSize: "11px", borderRadius: "3px", fontFamily: "'Courier New', monospace" }}
            >닫기</button>
          </div>
        </div>
      )}

      {/* Layers */}
      <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "3px" }}>
        {[...layers].reverse().map((layer, idx) => {
          const isExpanded = expandedLayer === layer.id;
          const isHovered = hoveredLayer === layer.id;
          const layerHasSearchMatch = searchQuery && layer.techs.some(t => isSearchHit(t.name));

          return (
            <div key={layer.id}>
              <div
                onClick={() => setExpandedLayer(isExpanded ? null : layer.id)}
                onMouseEnter={() => setHoveredLayer(layer.id)}
                onMouseLeave={() => setHoveredLayer(null)}
                style={{
                  display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px",
                  background: isExpanded ? `linear-gradient(90deg, ${layer.accent}15, #0d1117)` : isHovered ? "#0d1117" : "#0a0f1a",
                  border: `1px solid ${isExpanded ? layer.accent + "60" : layerHasSearchMatch ? layer.accent + "40" : "#1e293b"}`,
                  borderLeft: `3px solid ${isExpanded || isHovered || layerHasSearchMatch ? layer.accent : "#1e293b"}`,
                  cursor: "pointer", transition: "all 0.2s ease",
                }}
              >
                <div style={{ fontSize: "10px", color: layer.accent, letterSpacing: "1px", minWidth: "24px", opacity: 0.7 }}>L{layers.length - idx}</div>
                <div style={{ minWidth: "160px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: isExpanded ? layer.accent : "#94a3b8", letterSpacing: "1px", transition: "color 0.2s" }}>{layer.nameKo}</div>
                  <div style={{ fontSize: "10px", color: "#334155", marginTop: "2px" }}>{layer.name}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>{layer.description}</div>
                  <div style={{ fontSize: "11px", color: "#334155", marginTop: "2px" }}>{layer.subdesc}</div>
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "260px" }}>
                  {layer.techs.slice(0, isExpanded ? 0 : 3).map(tech => (
                    <span key={tech.name} style={{
                      fontSize: "10px", padding: "3px 8px", background: "#0d1117",
                      border: `1px solid ${liked[tech.name] ? "#a855f750" : "#1e293b"}`,
                      borderRadius: "3px", color: liked[tech.name] ? "#a855f7" : "#475569",
                    }}>{tech.name}{liked[tech.name] ? " ♥" : ""}</span>
                  ))}
                  {!isExpanded && layer.techs.length > 3 && (
                    <span style={{ fontSize: "10px", color: "#334155", padding: "3px 4px" }}>+{layer.techs.length - 3}</span>
                  )}
                </div>
                <div style={{ fontSize: "12px", color: "#334155", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▼</div>
              </div>

              {/* Expanded tech grid */}
              {isExpanded && (
                <div style={{
                  background: "#080d18", border: `1px solid ${layer.accent}30`, borderTop: "none",
                  padding: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px",
                }}>
                  {layer.techs.map(tech => {
                    const isSelected = selectedTech?.name === tech.name;
                    const rel = isRelated(tech.name);
                    const searchHit = isSearchHit(tech.name);
                    const isLiked = liked[tech.name];

                    return (
                      <div
                        key={tech.name}
                        onClick={e => { e.stopPropagation(); handleTechClick(tech, layer); }}
                        style={{
                          padding: "12px 14px", position: "relative",
                          background: isSelected ? `${layer.accent}20` : rel ? `${layer.accent}0d` : searchHit ? "#0a1828" : "#0d1117",
                          border: `1px solid ${isSelected ? layer.accent : rel ? layer.accent + "60" : searchHit ? "#0ea5e960" : "#1e293b"}`,
                          borderRadius: "4px", cursor: "pointer", transition: "all 0.15s ease",
                        }}
                      >
                        <span
                          onClick={e => toggleLike(e, tech.name)}
                          style={{
                            position: "absolute", top: "8px", right: "8px", fontSize: "11px",
                            color: isLiked ? "#a855f7" : "#1e293b", cursor: "pointer", transition: "color 0.15s",
                          }}
                          onMouseEnter={e => { if (!isLiked) e.currentTarget.style.color = "#a855f780"; }}
                          onMouseLeave={e => { if (!isLiked) e.currentTarget.style.color = "#1e293b"; }}
                        >{isLiked ? "♥" : "♡"}</span>

                        <div style={{ fontSize: "12px", fontWeight: "700", paddingRight: "16px", marginBottom: "6px", color: isSelected ? layer.accent : rel ? layer.accent : "#94a3b8" }}>
                          {tech.name}
                        </div>
                        <div style={{ fontSize: "10px", color: "#475569", lineHeight: "1.5" }}>{tech.desc}</div>

                        {/* Trend badge */}
                        {trendLoading[tech.name] && (
                          <div style={{ fontSize: "9px", color: "#334155", marginTop: "6px" }}>⏳ 로딩 중...</div>
                        )}
                        {trendData[tech.name] && trendData[tech.name] !== "error" && (
                          <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "10px", color: trendData[tech.name].badge.color, fontWeight: "700" }}>
                              {trendData[tech.name].badge.label}
                            </span>
                            <span style={{ fontSize: "9px", color: "#334155" }}>
                              ★ {trendData[tech.name].stars.toLocaleString()}
                            </span>
                          </div>
                        )}

                        {rel && <div style={{ fontSize: "9px", color: layer.accent, marginTop: "6px", letterSpacing: "1px" }}>↔ 연관 기술</div>}
                        {searchHit && searchQuery && <div style={{ fontSize: "9px", color: "#0ea5e9", marginTop: "6px" }}>🔍 검색 결과</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: "center", marginTop: "48px", fontSize: "10px", color: "#1e293b", letterSpacing: "2px" }}>
        TECH LAYER MAP · MVP v0.2
      </div>
    </div>
  );
}
