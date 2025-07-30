import React from "react";
import './Message.css';

const Message = ({ text, sender }) => {
    const messageClass = sender === 'user' ? 'user-message' : 'ai-message';

    return (
        <div className={'message-container ${messageClass}'}>
            <div classNAme="message-content">
                {text}
            </div>
        </div>
    );
};

export default Message;