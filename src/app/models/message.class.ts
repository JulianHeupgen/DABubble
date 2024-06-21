import { User } from './user.class';

/**
 * Represents a single message in a thread
 */
export class Message {
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  replies: Message[];
  emojiReactions: string[];
  imgFileURL: string;
  editMode: boolean;
  hoverReactionbar: boolean;

 /**
   * Constructs a new Message instance.
   * 
   * @param {Partial<User>} sender - The sender of the message.
   * @param {string} content - The content of the message.
   * @param {string} [imgFileUrl] - The URL of an image file associated with the message.
   */
  constructor(sender: Partial<User>, content: string, imgFileUrl?: string) {
    this.senderId = sender.id || '';
    this.senderName = sender.name || '';
    this.content = content;
    this.timestamp = new Date().getTime();
    this.replies = [];
    this.emojiReactions = [];
    this.imgFileURL = imgFileUrl !== undefined ? imgFileUrl : '';
    this.editMode = false;
    this.hoverReactionbar = false
  }


   /**
   * Converts the Message instance to a JSON object.
   * 
   * @returns {Object} The JSON representation of the message.
   */
  toJSON(): {} {
    return {
      senderId: this.senderId,
      senderName: this.senderName,
      content: this.content,
      timestamp: this.timestamp,
      replies: this.replies.map(reply => reply.toJSON()),  
      emojiReactions: this.emojiReactions,
      imgFileURL: this.imgFileURL,
      editMode: this.editMode,
      hoverReactionbar: this.hoverReactionbar,
    };
  }


   /**
   * Creates a Message instance from a JSON object.
   * 
   * @param {any} json - The JSON object to create the message from.
   * @returns {Message} The created Message instance.
   */
  static fromJSON(json: any): Message {       
    const message = new Message({ 
      id: json.senderId,
      name: json.senderName
    },
      json.content,
      json.imgFileURL
    );
    message.timestamp = json.timestamp;
    message.replies = json.replies.map((reply: any) => Message.fromJSON(reply));
    message.emojiReactions = json.emojiReactions;
    message.editMode = json.editMode;
    message.hoverReactionbar = json.hoverReactionbar;
    
    return message;
  }

}

