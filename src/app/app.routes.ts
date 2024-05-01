import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { ChannelChatComponent } from './dashboard/channel-chat/channel-chat.component';
import { UserChatComponent } from './dashboard/user-chat/user-chat.component';

export const routes: Routes = [
  { path: '', component: LoginComponent},
  {
    path: 'dashboard', component: DashboardComponent,
    children: [
      { path: 'channel/:id', component: ChannelChatComponent },
      { path: 'chat/:id', component: UserChatComponent },
    ]
  }
];

