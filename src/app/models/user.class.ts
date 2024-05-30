import { StorageService } from "../services/storage.service";
import { Channel } from "./channel.class";
import { Message } from "./message.class";
import { Thread } from "./thread.class";
import { UserChat } from "./user-chat";

export class User {
  id: string;
  name: string;
  email: string;
  onlineStatus: 'online' | 'offline' | 'away';
  channels: string[];
  userChats: UserChat[];
  authUserId: string;
  imageUrl: string;

 
  constructor(data: {
    id: string,
    name: string,
    email: string,
    onlineStatus: 'online' | 'offline' | 'away',
    authUserId: string,
    imageUrl: string,
    channels: string[],
    userChats: UserChat[],
  }) {
    this.id = data.id || '';
    this.name = data.name;
    this.email = data.email;
    this.onlineStatus = data.onlineStatus;
    this.authUserId = data.authUserId;
    this.imageUrl = data.imageUrl;
    this.channels = data.channels;
    this.userChats = data.userChats || [];
  }

  joinChannel(channelId: string, channel: Channel): void {
    if (!this.channels.includes(channelId)) {
      this.channels.push(channelId);
      channel.addParticipant(this);
    }
  }


  leaveChannel(channelId: string, channel: Channel): void {
    const index = this.channels.indexOf(channelId);
    if (index !== -1) {
      this.channels.splice(index, 1);
      channel.removeParticipant(this);
    }
  }


  changeStatus(status: 'online' | 'offline' | 'away'): void {
    this.onlineStatus = status;
  }


  async sendChannelMessage(channel: Channel, messageContent: string, imgFile?: File, replyToThread?: Thread) {        
    let imgFileURL;
    if (imgFile) {                                          
      let storage: StorageService = new StorageService;
      let imgURL = await storage.uploadFile(imgFile) as string;
      imgFileURL = imgURL;
    }

    if (replyToThread) {                                      
      let newMessage = new Message(this, messageContent, imgFileURL);
      replyToThread.messages.push(newMessage);
      return newMessage
    } else {                                                
      let newThread = new Thread({ channelId: channel.channelId, timestamp: new Date().getTime() });
      let newMessage = new Message(this, messageContent, imgFileURL);
      newThread.messages.push(JSON.stringify(newMessage));
      return newThread
    }
  }


  async sendDirectMessage(recipient: User, messageContent: string, imgFile?: File): Promise<any> {
    let imgFileURL;
    if (imgFile) {                                          
      let storage: StorageService = new StorageService;
      let imgURL = await storage.uploadFile(imgFile) as string;
      imgFileURL = imgURL;
    }

    let existingUserChat = this.userChats.find(chat =>
       chat.userChatId == recipient.id); 
       
    console.log(existingUserChat);

    if (existingUserChat) { 
      if (!(existingUserChat instanceof UserChat)) {
        existingUserChat = new UserChat(existingUserChat);
      }     

      const newMessage = new Message(this, messageContent);
      existingUserChat.addMessage(newMessage);
      return { ...existingUserChat, isNew: false }
    } else {                                                      
      const newUserChat = new UserChat({
        participants: [this.id, recipient.id],
      });
      const newMessage = new Message(this, messageContent);
      newUserChat.addMessage(newMessage);
      this.userChats.push(newUserChat);
      recipient.userChats.push(newUserChat);
      return { ...newUserChat, isNew: true };
    }
  }


  addReply(message: Message, sender: User, replyContent: string): void {       
    const replyMessage = new Message(sender, replyContent);
    message.replies.push(replyMessage);
  }


  addReaction(message: Message, emoji: string, reactor: User): void {          
    message.emojiReactions.push(emoji, reactor.name);
  }


  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      onlineStatus: this.onlineStatus,
      authUserId: this.authUserId,
      imageUrl: this.imageUrl,
      channels: this.channels,
      userChats: this.userChats
    }
  }

}

