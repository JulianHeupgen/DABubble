import { Channel } from "./channel.class";
import { DirectMessage } from "./direct-message";
import { Message } from "./message.class";
import { Thread } from "./thread.class";
import { UserChat } from "./user-chat";

export class User {
    name: string;
    email: string;
    onlineStatus: 'online' | 'offline';
    channels: Channel[];
    userChats: [];
    userId: string;          // "uid" von Authentication hier hinterlegen

    constructor(name: string, email: string, onlineStatus: 'online' | 'offline', userId: string) {
        this.name = name;
        this.email = email;
        this.onlineStatus = onlineStatus;
        this.channels = [];
        this.userChats = [];
        this.userId = userId;
    }

    joinChannel(channel: Channel): void {
        if (!this.channels.includes(channel)) {
            this.channels.push(channel);
            channel.addParticipant(this);
        }
    }

    leaveChannel(channel: Channel): void {
        const index = this.channels.indexOf(channel);
        if (index !== -1) {
            this.channels.splice(index, 1);
            channel.removeParticipant(this);
        }
    }

    changeStatus(status: 'online' | 'offline'): void {
        this.onlineStatus = status;
    }

    sendChannelMessage(channel: Channel, thread: Thread, messageContent: string): void {
        const newMessage = new Message(this, messageContent);
        thread.messages.push(newMessage);
        if (!channel.threads.includes(thread)) {
          channel.addThread(thread);
        }
    }

    sendUserChatMessage( userChat: UserChat, content: string): void {
        const sender = this; 
        const recipient = userChat.participants.find(user => user !== this); 
        if(recipient) {
            const newDirectMessage = new DirectMessage(9999, sender, recipient, content);     // 9999 ist Beispiel-ID / Parameter
            userChat.addMessage(newDirectMessage);
        }
    }
      
}

