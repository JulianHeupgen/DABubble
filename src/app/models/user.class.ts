import { Channel } from "./channel.class";

export class User { 
    name: string;
    email: string;
    onlineStatus: 'online' | 'offline';
    channels: Channel[];

    constructor(name: string, email: string, onlineStatus: 'online' | 'offline') {
        this.name = name;
        this.email = email;
        this.onlineStatus = onlineStatus;
        this.channels = [];
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

    sendMessage(channel: Channel, messageContent: string): void {
        channel.addMessage(this, messageContent);
      }

}

