import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { ChannelChatComponent } from './dashboard/channel-chat/channel-chat.component';
import { UserChatComponent } from './dashboard/user-chat/user-chat.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ImprintComponent } from './imprint/imprint.component';
import { RegisterComponent } from './register/register.component';
import { LogoComponent } from './animations/logo/logo.component';

export const routes: Routes = [
  { path: '',   redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent},
  { path: 'register', component: RegisterComponent},
  {
    path: 'dashboard', component: DashboardComponent,
    children: [
      { path: 'channel/:id', component: ChannelChatComponent },
      { path: 'chat/:id', component: UserChatComponent },
    ]
  },
  { path: 'privacy', component: PrivacyComponent},
  { path: 'imprint', component: ImprintComponent},
  { path: 'logo', component: LogoComponent}
];

