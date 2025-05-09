import { useState } from 'react';
import styles from './Chatbot.module.css'; // Import CSS module

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === '') return; // Prevent sending empty messages
    setMessages([...messages, { text: input, sender: 'user' }]);
    setInput('');
  };

  return (
    <div className={styles.chatbotContainer}>
      <div className={styles.chatHeader}>
        <h2 className={styles.chatTitle}>Chatbot</h2>
      </div>
      <div className={styles.chatWindow}>
        {messages.length === 0 && <div className={styles.placeholder}>Ask me a question</div>}
        {messages.map((msg, index) => (
          <div key={index} className={msg.sender === 'user' ? styles.userMessage : styles.botMessage}>
            {msg.text}
          </div>
        ))}
      </div>
      <form className={styles.inputForm} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button className={styles.sendButton} type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chatbot;