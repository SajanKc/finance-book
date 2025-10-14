import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Platform } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(private platform: Platform) {
    this.platform.ready().then(() => {
      this.enableFullscreen();
    });
  }

  async enableFullscreen() {
    try {
      // Hide status bar initially
      await StatusBar.hide();
      await StatusBar.setStyle({ style: Style.Dark });

      // On Android, re-hide when user swipes down
      if (this.platform.is('android')) {
        window.addEventListener('focus', async () => {
          await StatusBar.hide();
        });

        // Optional: re-hide when app resumes from background
        document.addEventListener('resume', async () => {
          await StatusBar.hide();
        });
      }
    } catch (e) {
      console.error('Error setting fullscreen', e);
    }
  }
}
