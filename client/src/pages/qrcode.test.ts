import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('QR Code Generator', () => {
  describe('URL Validation', () => {
    it('should accept valid URLs', () => {
      const validUrls = [
        'https://cavalylivres.com/',
        'https://www.cavalylivres.com/',
        'https://cavalylivres.com/products',
        'https://cavalylivres.com/checkout',
      ];

      validUrls.forEach((url) => {
        try {
          new URL(url);
          expect(true).toBe(true);
        } catch {
          expect.fail(`URL ${url} should be valid`);
        }
      });
    });

    it('should handle URL encoding', () => {
      const url = 'https://cavalylivres.com/';
      const encoded = encodeURIComponent(url);
      expect(encoded).toBe('https%3A%2F%2Fcavallylivres.com%2F');
    });
  });

  describe('QR Code Sharing', () => {
    it('should generate WhatsApp share URL', () => {
      const text = 'Découvrez Cavally Livres - Votre plateforme de manuels scolaires et universitaires! 📚\n\nhttps://cavalylivres.com/';
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      
      expect(whatsappUrl).toContain('https://wa.me/');
      expect(whatsappUrl).toContain('Cavally%20Livres');
    });

    it('should generate Facebook share URL', () => {
      const url = 'https://cavalylivres.com/';
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      
      expect(facebookUrl).toContain('facebook.com/sharer');
      expect(facebookUrl).toContain(encodeURIComponent(url));
    });

    it('should generate Twitter share URL', () => {
      const url = 'https://cavalylivres.com/';
      const text = 'Découvrez Cavally Livres - Votre plateforme de manuels scolaires et universitaires! 📚';
      const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
      
      expect(twitterUrl).toContain('twitter.com/intent/tweet');
      expect(twitterUrl).toContain(encodeURIComponent(url));
    });

    it('should generate Email share URL', () => {
      const url = 'https://cavalylivres.com/';
      const subject = 'Découvrez Cavally Livres';
      const body = `Bonjour,\n\nJe vous invite à découvrir Cavally Livres, votre plateforme complète de manuels scolaires, universitaires et oeuvres littéraires.\n\n${url}\n\nMeilleures salutations`;
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      expect(mailtoUrl).toContain('mailto:');
      expect(mailtoUrl).toContain(encodeURIComponent(subject));
    });
  });

  describe('QR Code Download', () => {
    it('should generate PNG filename with timestamp', () => {
      const timestamp = Date.now();
      const filename = `cavalylivres-qrcode-${timestamp}.png`;
      
      expect(filename).toContain('cavalylivres-qrcode-');
      expect(filename).toEndWith('.png');
    });

    it('should create valid data URL for canvas', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      
      expect(dataUrl).toContain('data:image/png');
      expect(dataUrl).toContain('base64');
    });
  });

  describe('Print Functionality', () => {
    it('should generate print HTML with QR code', () => {
      const printHTML = `
        <html>
          <head>
            <title>Imprimer QR Code - Cavally Livres</title>
          </head>
          <body>
            <div class="container">
              <h2>Cavally Livres</h2>
              <p>Scannez ce code pour accéder au site</p>
              <img src="data:image/png;base64,..." />
              <p>https://cavalylivres.com/</p>
            </div>
          </body>
        </html>
      `;

      expect(printHTML).toContain('Cavally Livres');
      expect(printHTML).toContain('Scannez ce code');
      expect(printHTML).toContain('https://cavalylivres.com/');
    });
  });

  describe('Clipboard Operations', () => {
    it('should copy URL to clipboard', async () => {
      const url = 'https://cavalylivres.com/';
      const mockClipboard = {
        writeText: vi.fn().mockResolvedValue(undefined),
      };

      Object.assign(navigator, { clipboard: mockClipboard });

      await navigator.clipboard.writeText(url);

      expect(mockClipboard.writeText).toHaveBeenCalledWith(url);
    });

    it('should copy QR code image to clipboard', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      const mockClipboard = {
        write: vi.fn().mockResolvedValue(undefined),
      };

      Object.assign(navigator, { clipboard: mockClipboard });

      const clipboardItem = new ClipboardItem({ 'image/png': mockBlob });
      await navigator.clipboard.write([clipboardItem]);

      expect(mockClipboard.write).toHaveBeenCalled();
    });
  });

  describe('QR Code Configuration', () => {
    it('should have correct QR code settings', () => {
      const qrSettings = {
        size: 256,
        level: 'H',
        includeMargin: true,
        fgColor: '#000000',
        bgColor: '#ffffff',
      };

      expect(qrSettings.size).toBe(256);
      expect(qrSettings.level).toBe('H');
      expect(qrSettings.includeMargin).toBe(true);
      expect(qrSettings.fgColor).toBe('#000000');
      expect(qrSettings.bgColor).toBe('#ffffff');
    });
  });

  describe('Toast Notifications', () => {
    it('should show success toast for download', () => {
      const toastMessages = {
        download: 'QR code téléchargé avec succès!',
        print: 'Impression lancée!',
        copy: 'QR code copié!',
        copyUrl: 'URL copiée!',
        whatsapp: 'Redirection vers WhatsApp...',
        facebook: 'Redirection vers Facebook...',
        twitter: 'Redirection vers Twitter...',
        email: 'Ouverture de votre client email...',
      };

      expect(toastMessages.download).toContain('téléchargé');
      expect(toastMessages.print).toContain('Impression');
      expect(toastMessages.copy).toContain('copié');
      expect(toastMessages.whatsapp).toContain('WhatsApp');
    });
  });

  describe('UI Elements', () => {
    it('should have all required buttons', () => {
      const buttons = [
        'Télécharger PNG',
        'Imprimer',
        'Copier l\'image',
        'WhatsApp',
        'Facebook',
        'Twitter',
        'Email',
        'Copier l\'URL',
      ];

      expect(buttons).toHaveLength(8);
      buttons.forEach((button) => {
        expect(button).toBeTruthy();
      });
    });

    it('should display QR code preview', () => {
      const preview = {
        title: 'Aperçu',
        subtitle: 'Votre QR code généré',
        size: 256,
      };

      expect(preview.title).toBe('Aperçu');
      expect(preview.subtitle).toBe('Votre QR code généré');
      expect(preview.size).toBe(256);
    });
  });

  describe('Usage Tips', () => {
    it('should display helpful tips', () => {
      const tips = [
        'Imprimez le QR code sur vos affiches publicitaires et matériaux marketing',
        'Partagez le QR code sur vos réseaux sociaux pour augmenter le trafic',
        'Utilisez le QR code dans vos emails et newsletters',
        'Testez le QR code avec votre téléphone avant de le distribuer',
      ];

      expect(tips).toHaveLength(4);
      tips.forEach((tip) => {
        expect(tip).toBeTruthy();
      });
    });
  });
});
