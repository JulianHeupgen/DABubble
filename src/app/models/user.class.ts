import { StorageService } from "../services/storage.service";
import { Channel } from "./channel.class";
import { Message } from "./message.class";
import { Thread } from "./thread.class";
import { UserChat } from "./user-chat";

/**
 * Represents a user in the chat application.
 */
export class User {
  id: string;
  name: string;
  email: string;
  onlineStatus: 'online' | 'offline' | 'away';
  channels: string[];
  userChats: UserChat[];
  authUserId: string;
  imageUrl: string;

 
  /**
   * Constructs a new User instance.
   * 
   * @param {Object} data - The data to initialize the User instance with.
   * @param {string} data.id - The unique identifier of the user.
   * @param {string} data.name - The name of the user.
   * @param {string} data.email - The email address of the user.
   * @param {'online' | 'offline' | 'away'} data.onlineStatus - The online status of the user.
   * @param {string} data.authUserId - The authenticated user ID.
   * @param {string} data.imageUrl - The URL of the user's profile image.
   * @param {string[]} data.channels - The list of channel IDs the user has joined.
   * @param {UserChat[]} data.userChats - The list of user chats the user is part of.
   */
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


  /**
   * Joins a channel and adds the user as a participant.
   * 
   * @param {string} channelId - The ID of the channel to join.
   * @param {Channel} channel - The channel object.
   */
  joinChannel(channelId: string, channel: Channel): void {
    if (!this.channels.includes(channelId)) {
      this.channels.push(channelId);
      channel.addParticipant(this);
    }
  }


   /**
   * Leaves a channel and removes the user as a participant.
   * 
   * @param {string} channelId - The ID of the channel to leave.
   * @param {Channel} channel - The channel object.
   */
  leaveChannel(channelId: string, channel: Channel): void {
    const index = this.channels.indexOf(channelId);
    if (index !== -1) {
      this.channels.splice(index, 1);
      channel.removeParticipant(this);
    }
  }


   /**
   * Changes the online status of the user.
   * 
   * @param {'online' | 'offline' | 'away'} status - The new online status.
   */
  changeStatus(status: 'online' | 'offline' | 'away'): void {
    this.onlineStatus = status;
  }


  /**
   * Sends a message to a channel.
   * 
   * @param {Channel} channel - The channel to send the message to.
   * @param {string} messageContent - The content of the message.
   * @param {File} [imgFile] - An optional image file to include in the message.
   * @param {Thread} [replyToThread] - An optional thread to reply to.
   * @returns {Promise<Thread | Message>} - A promise that resolves to the new thread or message.
   */
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


  /**
   * Sends a direct message to another user.
   * 
   * @param {User} recipient - The recipient of the direct message.
   * @param {string} messageContent - The content of the message.
   * @param {UserChat} [currentUserChat] - An optional existing chat between the users.
   * @param {File} [imgFile] - An optional image file to include in the message.
   * @returns {Promise<{ currentUserChat: UserChat, isNew: boolean }>} - A promise that resolves to the user chat and whether it is new.
   */
  async sendDirectMessage(recipient: User, messageContent: string, currentUserChat: UserChat | undefined, imgFile?: File): Promise<any> {
    let imgFileURL;
    if (imgFile) {                                          
      let storage: StorageService = new StorageService;
      let imgURL = await storage.uploadFile(imgFile) as string;
      imgFileURL = imgURL;
    }
    if(currentUserChat != undefined) {
      const newThread = new Thread( { timestamp: new Date().getTime() } );
      let newMessage = new Message(this, messageContent, imgFileURL);
      newThread.messages.push(newMessage);
      currentUserChat.addThread(newThread);
      return { currentUserChat, isNew: false }
    } else {
        currentUserChat = new UserChat({
          participants: [this.id, recipient.id],
        });
        const newThread = new Thread( { timestamp: new Date().getTime() } );
        let newMessage = new Message(this, messageContent, imgFileURL);
        newThread.messages.push(newMessage);
        currentUserChat.addThread(newThread);
        this.userChats.push(currentUserChat);
        recipient.userChats.push(currentUserChat);
        return { currentUserChat, isNew: true };
      }
    }


    /**
   * Adds a reply to a message.
   * 
   * @param {Message} message - The message to reply to.
   * @param {User} sender - The sender of the reply.
   * @param {string} replyContent - The content of the reply.
   */
  addReply(message: Message, sender: User, replyContent: string): void {       
    const replyMessage = new Message(sender, replyContent);
    message.replies.push(replyMessage);
  }


  /**
   * Adds a reaction to a message.
   * 
   * @param {Message} message - The message to react to.
   * @param {string} emoji - The emoji reaction.
   * @param {User} reactor - The user who reacted.
   */
  addReaction(message: Message, emoji: string, reactor: User): void {          
    message.emojiReactions.push(emoji, reactor.name);
  }


   /**
   * Converts the User instance to a JSON object.
   * 
   * @returns {Object} The JSON representation of the user.
   */
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
