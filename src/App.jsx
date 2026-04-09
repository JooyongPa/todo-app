import { useState, useEffect } from "react";

function App() {

  const [todos, setTodos] = useState(() => {
  const saved = localStorage.getItem("todos");
  return saved ? JSON.parse(saved) : [];
});
  const [input, setInput] = useState("");

  const addTodo = () => {
  if (input.trim() === "") return;
  setTodos([...todos, { text: input, done: false }]);
  setInput("");
};
  const deleteTodo = (index) => {
  const newTodos = todos.filter((_, i) => i !== index);
  setTodos(newTodos);
};
const toggleTodo = (index) => {
  const newTodos = [...todos];
  newTodos[index].done = !newTodos[index].done;
  setTodos(newTodos);
};
useEffect(() => {
  localStorage.setItem("todos", JSON.stringify(todos));
}, [todos]);
const [filter, setFilter] = useState("all");

const filteredTodos = todos.filter((todo) => {
  if (filter === "done") return todo.done;
  if (filter === "notDone") return !todo.done;
  return true;
});

return (
    <div>
      <h1>To-Do App 🔥</h1>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="할 일을 입력하세요"
      />

      <button onClick={addTodo}>추가</button>
      <div style={{ marginTop: "10px" }}>
  <button onClick={() => setFilter("all")}>전체</button>
  <button onClick={() => setFilter("done")}>완료</button>
  <button onClick={() => setFilter("notDone")}>미완료</button>
</div>

<ul style={{ listStyle: "none", padding: 0 }}>
  {filteredTodos.map((todo, index) => (
    <li key={index} style={{ marginBottom: "10px" }}>
  {/* 체크박스 */}
<input
  type="checkbox"
  checked={todo.done}
  onChange={() => toggleTodo(index)}
/>

{/* 텍스트 */}
<span
  style={{
    marginLeft: "10px",
    textDecoration: todo.done ? "line-through" : "none",
    opacity: todo.done ? 0.5 : 1,
  }}
>
  {todo.text}
</span>

{/* 삭제 버튼 */}
<button
  style={{ marginLeft: "10px" }}
  onClick={() => deleteTodo(index)}
>
  삭제
</button>
</li>
  ))}
</ul>
    </div>
  );
}

export default App;