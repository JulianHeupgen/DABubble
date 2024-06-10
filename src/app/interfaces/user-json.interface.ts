export interface UserJson {
    id: string;
    name: string;
    email: string;
    onlineStatus: 'online' | 'offline' | 'away';
    channels: string[];
    userChats: string[];
    authUserId: string;
    imageUrl: string;
  }

// Interface notwendig ?? siehe dataservice