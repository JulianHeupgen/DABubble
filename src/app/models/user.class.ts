import { Channel } from "./channel.class";
import { Message } from "./message.class";
import { Thread } from "./thread.class";

export class User {
    name: string;
    email: string;
    onlineStatus: 'online' | 'offline';
    channels: Channel[];
    userId: string;          // "uid" von Authentication hier hinterlegen

    constructor(name: string, email: string, onlineStatus: 'online' | 'offline', userId: string) {
        this.name = name;
        this.email = email;
        this.onlineStatus = onlineStatus;
        this.channels = [];
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

    sendMessage(channel: Channel, thread: Thread, messageContent: string): void {
        const newMessage = new Message(this, messageContent);
        thread.messages.push(newMessage);
        if (!channel.threads.includes(thread)) {
          channel.addThread(thread);
        }
      }

      
}

