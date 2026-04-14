import { useState, useEffect } from "react";

// 날짜 헬퍼
const todayKey = () => new Date().toISOString().slice(0, 10);
const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};
const fmtDate = (key) => {
  const [y, m, d] = key.split("-");
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;
};

const EMOJIS = ["📚","🧹","🎨","💪","🛒","✍️","🏃","🍳","📞","💻","🎵","🌱"];
const getEmoji = (text) => EMOJIS[text.length % EMOJIS.length];

const DEFAULT_CATEGORIES = [
  { id: "work",     label: "업무",   icon: "💼", color: "#3B82F6", bg: "#EFF6FF" },
  { id: "personal", label: "개인",   icon: "🙋", color: "#8B5CF6", bg: "#F5F3FF" },
  { id: "learn",    label: "교육",   icon: "📖", color: "#10B981", bg: "#ECFDF5" },
  { id: "etc",      label: "기타",   icon: "📦", color: "#F59E0B", bg: "#FFFBEB" },
];

const loadData = (key) => {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : null; }
  catch { return null; }
};
const saveData = (key, val) => localStorage.setItem(key, JSON.stringify(val));

export default function App() {
  const [tab, setTab] = useState("today");
  const [todos, setTodos] = useState(() => loadData("todos_" + todayKey()) || []);
  const [categories, setCategories] = useState(() => loadData("categories") || DEFAULT_CATEGORIES);
  const [input, setInput] = useState("");
  const [selCat, setSelCat] = useState("work");
  const [filterCat, setFilterCat] = useState("all");
  const [important, setImportant] = useState(false);
  const [yesterdayTodos, setYesterdayTodos] = useState([]);
  const [showCatMgr, setShowCatMgr] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("🏷️");

  useEffect(() => { saveData("todos_" + todayKey(), todos); }, [todos]);
  useEffect(() => { saveData("categories", categories); }, [categories]);
  useEffect(() => {
    if (tab === "review") setYesterdayTodos(loadData("todos_" + yesterdayKey()) || []);
  }, [tab]);

  const addTodo = () => {
    if (input.trim() === "") return;
    setTodos([...todos, { id: Date.now(), text: input.trim(), done: false, catId: selCat, important }]);
    setInput("");
    setImportant(false);
  };

  const toggleTodo = (id) => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const toggleImportant = (id) => setTodos(todos.map(t => t.id === id ? { ...t, important: !t.important } : t));
  const deleteTodo = (id) => setTodos(todos.filter(t => t.id !== id));

  const carryOver = (todo) => {
    if (todos.find(t => t.text === todo.text)) return;
    setTodos([...todos, { ...todo, id: Date.now(), done: false }]);
    setTab("today");
  };

  const addCategory = () => {
    if (!newCatLabel.trim()) return;
    const colors = ["#EC4899","#06B6D4","#F97316","#6366F1"];
    const bgs = ["#FDF2F8","#ECFEFF","#FFF7ED","#EEF2FF"];
    const ci = categories.length % 4;
    setCategories([...categories, {
      id: "cat_" + Date.now(),
      label: newCatLabel.trim(),
      icon: newCatIcon,
      color: colors[ci],
      bg: bgs[ci],
    }]);
    setNewCatLabel("");
    setNewCatIcon("🏷️");
  };

  const deleteCategory = (id) => {
    if (categories.length <= 1) return;
    setCategories(categories.filter(c => c.id !== id));
    if (selCat === id) setSelCat(categories[0].id);
    if (filterCat === id) setFilterCat("all");
  };

  const getCat = (id) => categories.find(c => c.id === id) || categories[categories.length - 1];

  const filtered = todos
    .filter(t => filterCat === "all" || t.catId === filterCat)
    .sort((a, b) => (b.important ? 1 : 0) - (a.important ? 1 : 0));

  const doneTodos = todos.filter(t => t.done);
  const progress = todos.length ? Math.round((doneTodos.length / todos.length) * 100) : 0;
  const yDone = yesterdayTodos.filter(t => t.done);
  const ySkip = yesterdayTodos.filter(t => !t.done);

  return (
    <div style={s.bg}>
      <div style={s.container}>

        {/* 헤더 */}
        <div style={s.header}>
          <h1 style={s.title}>⭐ 오늘의 할 일</h1>
          <p style={s.dateLabel}>{fmtDate(todayKey())}</p>
        </div>

        {/* 메인 탭 */}
        <div style={s.tabRow}>
          <button style={{ ...s.tab, ...(tab === "today" ? s.tabActive : {}) }} onClick={() => setTab("today")}>오늘</button>
          <button style={{ ...s.tab, ...(tab === "review" ? s.tabActive : {}) }} onClick={() => setTab("review")}>어제 리뷰</button>
          <button style={{ ...s.tab, ...(showCatMgr ? s.tabActive : {}), marginLeft: "auto" }} onClick={() => setShowCatMgr(!showCatMgr)}>⚙️ 카테고리</button>
        </div>

        {/* 카테고리 관리 패널 */}
        {showCatMgr && (
          <div style={s.catPanel}>
            <p style={s.sectionTitle}>카테고리 관리</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
              {categories.map(c => (
                <div key={c.id} style={{ ...s.catChip, background: c.bg, border: `1px solid ${c.color}40` }}>
                  <span style={{ fontSize: "13px", color: c.color }}>{c.icon} {c.label}</span>
                  {categories.length > 1 && (
                    <button style={s.catDelBtn} onClick={() => deleteCategory(c.id)}>×</button>
                  )}
                </div>
              ))}
            </div>
            <div style={s.catAddRow}>
              <input
                style={{ ...s.input, width: "52px", textAlign: "center", padding: "10px 6px" }}
                value={newCatIcon}
                onChange={e => setNewCatIcon(e.target.value)}
                maxLength={2}
                placeholder="🏷️"
              />
              <input
                style={{ ...s.input, flex: 1 }}
                value={newCatLabel}
                onChange={e => setNewCatLabel(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addCategory()}
                placeholder="새 카테고리 이름 입력"
              />
              <button style={s.addBtn} onClick={addCategory}>+</button>
            </div>
          </div>
        )}

        {/* 오늘 탭 */}
        {tab === "today" && (
          <div>
            {/* 진행률 */}
            <div style={s.progressWrap}>
              <div style={s.progressLabelRow}>
                <span style={s.progressLabel}>진행률</span>
                <span style={s.progressCount}>{doneTodos.length} / {todos.length}</span>
              </div>
              <div style={s.progressBar}>
                <div style={{ ...s.progressFill, width: `${progress}%` }} />
              </div>
            </div>

            {/* 입력 카드 */}
            <div style={s.inputCard}>
              {/* 카테고리 선택 */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
                {categories.map(c => (
                  <button
                    key={c.id}
                    style={{
                      ...s.catSelectBtn,
                      background: selCat === c.id ? c.color : c.bg,
                      color: selCat === c.id ? "#fff" : c.color,
                      border: `1px solid ${c.color}60`,
                    }}
                    onClick={() => setSelCat(c.id)}
                  >
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>

              {/* 입력행 */}
              <div style={s.inputRow}>
                <input
                  style={s.input}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addTodo()}
                  placeholder="할 일을 입력해요..."
                />
                <button
                  style={{ ...s.starToggleBtn, color: important ? "#F59E0B" : "#ccc" }}
                  onClick={() => setImportant(!important)}
                  title="중요 표시"
                >★</button>
                <button style={s.addBtn} onClick={addTodo}>+</button>
              </div>
              {important && <p style={s.importantHint}>⭐ 중요 항목으로 추가됩니다 — 목록 맨 위에 표시돼요</p>}
            </div>

            {/* 카테고리 필터 */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
              <button
                style={{ ...s.filterBtn, ...(filterCat === "all" ? s.filterBtnActive : {}) }}
                onClick={() => setFilterCat("all")}
              >전체 {todos.length}</button>
              {categories.map(c => {
                const cnt = todos.filter(t => t.catId === c.id).length;
                if (cnt === 0) return null;
                return (
                  <button
                    key={c.id}
                    style={{
                      ...s.filterBtn,
                      ...(filterCat === c.id
                        ? { background: c.color, color: "#fff", border: `1px solid ${c.color}` }
                        : {}),
                    }}
                    onClick={() => setFilterCat(c.id)}
                  >
                    {c.icon} {c.label} {cnt}
                  </button>
                );
              })}
            </div>

            {/* 할일 목록 */}
            {filtered.length === 0 ? (
              <div style={s.emptyState}>할 일을 추가해보세요 ✨</div>
            ) : (
              filtered.map(todo => {
                const cat = getCat(todo.catId);
                return (
                  <div
                    key={todo.id}
                    style={{
                      ...s.todoItem,
                      opacity: todo.done ? 0.55 : 1,
                      borderLeft: todo.important ? "3px solid #F59E0B" : "3px solid transparent",
                    }}
                  >
                    <div
                      style={{ ...s.checkCircle, ...(todo.done ? s.checkCircleDone : {}) }}
                      onClick={() => toggleTodo(todo.id)}
                    >
                      {todo.done && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        {todo.important && <span style={{ fontSize: "12px" }}>⭐</span>}
                        <span style={{
                          ...s.todoText,
                          textDecoration: todo.done ? "line-through" : "none",
                          color: todo.done ? "#aaa" : "#333",
                        }}>
                          {getEmoji(todo.text)} {todo.text}
                        </span>
                      </div>
                      <span style={{ ...s.catBadge, background: cat.bg, color: cat.color }}>
                        {cat.icon} {cat.label}
                      </span>
                    </div>

                    <button
                      style={{ ...s.starBtn, color: todo.important ? "#F59E0B" : "#ddd" }}
                      onClick={() => toggleImportant(todo.id)}
                    >★</button>
                    <button style={s.delBtn} onClick={() => deleteTodo(todo.id)}>🗑</button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 어제 리뷰 탭 */}
        {tab === "review" && (
          <div>
            <p style={s.reviewDateLabel}>{fmtDate(yesterdayKey())} 리뷰</p>

            {yesterdayTodos.length === 0 ? (
              <div style={s.emptyState}>어제 데이터가 없어요.<br />오늘부터 기록을 시작해보세요!</div>
            ) : (
              <>
                {yDone.length > 0 && (
                  <div>
                    <p style={s.sectionTitle}>✅ 완료한 일 ({yDone.length})</p>
                    {yDone.map(t => {
                      const cat = getCat(t.catId);
                      return (
                        <div key={t.id} style={s.reviewItem}>
                          <span style={{ ...s.badge, background: "#E1F5EE", color: "#0F6E56" }}>완료</span>
                          {t.important && <span style={{ fontSize: "12px" }}>⭐</span>}
                          <span style={s.reviewText}>{getEmoji(t.text)} {t.text}</span>
                          <span style={{ ...s.catBadge, background: cat.bg, color: cat.color }}>{cat.icon} {cat.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {ySkip.length > 0 && (
                  <div style={{ marginTop: "1rem" }}>
                    <p style={s.sectionTitle}>⚡ 미진한 일 ({ySkip.length})</p>
                    {ySkip.map(t => {
                      const cat = getCat(t.catId);
                      return (
                        <div key={t.id} style={s.reviewItem}>
                          <span style={{ ...s.badge, background: "#FEF3C7", color: "#92400E" }}>미진</span>
                          {t.important && <span style={{ fontSize: "12px" }}>⭐</span>}
                          <span style={s.reviewText}>{getEmoji(t.text)} {t.text}</span>
                          <span style={{ ...s.catBadge, background: cat.bg, color: cat.color }}>{cat.icon} {cat.label}</span>
                          <button style={s.carryBtn} onClick={() => carryOver(t)}>오늘로 →</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

const s = {
  bg: { minHeight: "100vh", background: "#F5F4EE", display: "flex", justifyContent: "center", padding: "2rem 1rem" },
  container: { width: "100%", maxWidth: "480px" },
  header: { textAlign: "center", marginBottom: "1.5rem" },
  title: { fontSize: "26px", fontWeight: "600", color: "#2D2D2D", marginBottom: "4px" },
  dateLabel: { fontSize: "14px", color: "#888" },
  tabRow: { display: "flex", gap: "8px", marginBottom: "1.25rem" },
  tab: { padding: "8px 18px", borderRadius: "20px", border: "1px solid #ddd", fontSize: "13px", fontWeight: "500", cursor: "pointer", background: "#fff", color: "#888" },
  tabActive: { background: "#1D9E75", color: "#fff", border: "1px solid #1D9E75" },
  catPanel: { background: "#fff", borderRadius: "14px", border: "1px solid #F0F0F0", padding: "1rem 1.25rem", marginBottom: "1rem" },
  catChip: { display: "flex", alignItems: "center", gap: "6px", padding: "5px 10px", borderRadius: "20px" },
  catDelBtn: { background: "none", border: "none", cursor: "pointer", color: "#bbb", fontSize: "16px", lineHeight: 1, padding: "0 2px" },
  catAddRow: { display: "flex", gap: "8px" },
  progressWrap: { marginBottom: "1.25rem" },
  progressLabelRow: { display: "flex", justifyContent: "space-between", marginBottom: "8px" },
  progressLabel: { fontSize: "13px", color: "#888" },
  progressCount: { fontSize: "13px", fontWeight: "600", color: "#1D9E75" },
  progressBar: { height: "6px", background: "#E8E8E8", borderRadius: "3px", overflow: "hidden" },
  progressFill: { height: "100%", background: "#1D9E75", borderRadius: "3px", transition: "width 0.3s ease" },
  inputCard: { background: "#fff", borderRadius: "14px", border: "1px solid #F0F0F0", padding: "1rem", marginBottom: "12px" },
  inputRow: { display: "flex", gap: "8px" },
  input: { flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1px solid #E8E8E8", fontSize: "14px", background: "#FAFAFA", color: "#333", outline: "none" },
  starToggleBtn: { width: "40px", height: "40px", borderRadius: "10px", border: "1px solid #E8E8E8", background: "#FAFAFA", fontSize: "20px", cursor: "pointer", flexShrink: 0 },
  addBtn: { width: "40px", height: "40px", borderRadius: "10px", background: "#1D9E75", color: "#fff", border: "none", fontSize: "22px", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" },
  importantHint: { fontSize: "12px", color: "#F59E0B", marginTop: "6px", paddingLeft: "2px" },
  catSelectBtn: { padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "500", cursor: "pointer" },
  filterBtn: { padding: "5px 12px", borderRadius: "20px", border: "1px solid #E0E0E0", fontSize: "12px", cursor: "pointer", background: "#fff", color: "#666" },
  filterBtnActive: { background: "#1D9E75", color: "#fff", border: "1px solid #1D9E75" },
  todoItem: { display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", background: "#fff", borderRadius: "14px", border: "1px solid #F0F0F0", marginBottom: "8px" },
  checkCircle: { width: "22px", height: "22px", borderRadius: "50%", border: "2px solid #D0D0D0", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" },
  checkCircleDone: { background: "#1D9E75", border: "2px solid #1D9E75" },
  todoText: { fontSize: "14px" },
  catBadge: { fontSize: "11px", fontWeight: "500", padding: "2px 7px", borderRadius: "8px", display: "inline-block", marginTop: "3px" },
  starBtn: { fontSize: "18px", background: "none", border: "none", cursor: "pointer", flexShrink: 0, padding: "0 2px" },
  delBtn: { width: "28px", height: "28px", borderRadius: "6px", border: "none", background: "transparent", cursor: "pointer", fontSize: "13px", opacity: 0.4, flexShrink: 0 },
  emptyState: { textAlign: "center", padding: "2.5rem 1rem", color: "#aaa", fontSize: "14px", lineHeight: 1.8 },
  reviewDateLabel: { fontSize: "12px", color: "#aaa", textAlign: "center", marginBottom: "1rem" },
  sectionTitle: { fontSize: "13px", fontWeight: "500", color: "#888", marginBottom: "10px", paddingLeft: "4px" },
  reviewItem: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "#fff", borderRadius: "14px", border: "1px solid #F0F0F0", marginBottom: "8px" },
  badge: { fontSize: "11px", fontWeight: "600", padding: "3px 8px", borderRadius: "10px", flexShrink: 0 },
  reviewText: { flex: 1, fontSize: "13px", color: "#444" },
  carryBtn: { fontSize: "12px", padding: "4px 10px", borderRadius: "8px", border: "1px solid #93C5FD", color: "#1D4ED8", background: "transparent", cursor: "pointer", flexShrink: 0 },
};
