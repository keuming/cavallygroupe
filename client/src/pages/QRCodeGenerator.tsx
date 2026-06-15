import jsPDF from 'jspdf';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Share2, Printer, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useRef } from 'react';

export default function QRCodeGenerator() {
  const [url, setUrl] = useState('https://www.cavallygroupe.com');
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Télécharger le QR code en PNG, JPEG ou PDF
  const downloadQRCode = (format: 'png' | 'jpeg' | 'pdf' = 'png') => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) {
      toast.error('QR code non trouvé');
      return;
    }

    const link = document.createElement('a');
    const timestamp = Date.now();

    if (format === 'pdf') {
      // Télécharger en PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 100;
      const imgHeight = 100;
      const x = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;
      const y = (pdf.internal.pageSize.getHeight() - imgHeight) / 2;
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      pdf.save(`cavalylivres-qrcode-${timestamp}.pdf`);
      toast.success('QR code téléchargé en PDF!');
    } else if (format === 'jpeg') {
      // Télécharger en JPEG
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      link.href = imgData;
      link.download = `cavalylivres-qrcode-${timestamp}.jpeg`;
      link.click();
      toast.success('QR code téléchargé en JPEG!');
    } else {
      // Télécharger en PNG (par défaut)
      link.href = canvas.toDataURL('image/png');
      link.download = `cavalylivres-qrcode-${timestamp}.png`;
      link.click();
      toast.success('QR code téléchargé en PNG!');
    }
  };

  // Imprimer le QR code
  const printQRCode = () => {
    const qrCanvas = qrRef.current?.querySelector('canvas');
    if (!qrCanvas) {
      toast.error('QR code non trouvé');
      return;
    }
    const printWindow = window.open('', '', 'height=400,width=400');
    if (printWindow) {
      const imgData = qrCanvas.toDataURL('image/png');
      printWindow.document.write(`
        <html>
          <head>
            <title>Imprimer QR Code - Cavally Livres</title>
            <style>
              body {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: white;
                font-family: Arial, sans-serif;
              }
              .container {
                text-align: center;
              }
              img {
                max-width: 400px;
                margin: 20px 0;
              }
              h2 {
                color: #0066cc;
                margin-bottom: 10px;
              }
              p {
                color: #666;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Cavally Livres</h2>
              <p>Scannez ce code pour accéder au site</p>
              <img src="${imgData}" />
              <p>https://www.cavallygroupe.com</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      toast.success('Impression lancée!');
    }
  };

  // Partager le QR code seul via WhatsApp
  const shareQRWhatsApp = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'qrcode.png', { type: 'image/png' });
          if (navigator.share) {
            navigator.share({
              title: 'Cavally Livres QR Code',
              text: 'Scannez ce QR code pour accéder à Cavally Livres!',
              files: [file]
            }).catch(() => {
              // Fallback si share n'est pas supporté
              const text = `Scannez ce QR code pour accéder à Cavally Livres! 📚\nhttps://www.cavallygroupe.com`;
              const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
              window.open(whatsappUrl, '_blank');
            });
          } else {
            const text = `Scannez ce QR code pour accéder à Cavally Livres! 📚\nhttps://www.cavallygroupe.com`;
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(whatsappUrl, '_blank');
          }
          toast.success('Partage du QR code lancé!');
        }
      });
    }
  };

  // Partager via WhatsApp (ancienne version avec URL)
  const shareWhatsApp = () => {
    const text = `Découvrez Cavally Livres - Votre plateforme de manuels scolaires et universitaires! 📚\n\nhttps://www.cavallygroupe.com`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Redirection vers WhatsApp...');
  };

  // Partager via Facebook
  const shareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    toast.success('Redirection vers Facebook...');
  };

  // Partager via Twitter
  const shareTwitter = () => {
    const text = 'Découvrez Cavally Livres - Votre plateforme de manuels scolaires et universitaires! 📚';
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    toast.success('Redirection vers Twitter...');
  };

  // Partager via Email
  const shareEmail = () => {
    const subject = 'Découvrez Cavally Livres';
    const body = `Bonjour,\n\nJe vous invite à découvrir Cavally Livres, votre plateforme complète de manuels scolaires, universitaires et oeuvres littéraires.\n\n${url}\n\nMeilleures salutations`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    toast.success('Ouverture de votre client email...');
  };

  // Copier l'URL
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('URL copiée!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Copier le QR code en image
  const copyQRToClipboard = async () => {
    const qrCanvas = qrRef.current?.querySelector('canvas');
    if (!qrCanvas) {
      toast.error('QR code non trouvé');
      return;
    }
    try {
      qrCanvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          toast.success('QR code copié!');
        }
      });
    } catch (err) {
      toast.error('Erreur lors de la copie');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Générateur de QR Code</h1>
          <p className="text-gray-600">Créez, imprimez et partagez facilement votre QR code Cavally Livres</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne gauche - Génération */}
          <div>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Personnalisez votre QR code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-base font-semibold">
                    URL à encoder
                  </Label>
                  <Input
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.cavallygroupe.com"
                    className="text-base"
                  />
                  <p className="text-sm text-gray-500">
                    L'URL sera encodée dans le QR code
                  </p>
                </div>

                {/* Actions d'impression et téléchargement */}
                <div className="space-y-3 pt-4 border-t">
                  <h3 className="font-semibold text-gray-900">Actions</h3>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Télécharger le QR code</p>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        onClick={() => downloadQRCode('png')}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                        size="sm"
                      >
                        <Download className="mr-1 h-3 w-3" />
                        PNG
                      </Button>
                      <Button
                        onClick={() => downloadQRCode('jpeg')}
                        className="bg-orange-600 hover:bg-orange-700 text-white text-xs"
                        size="sm"
                      >
                        <Download className="mr-1 h-3 w-3" />
                        JPEG
                      </Button>
                      <Button
                        onClick={() => downloadQRCode('pdf')}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs"
                        size="sm"
                      >
                        <Download className="mr-1 h-3 w-3" />
                        PDF
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={printQRCode}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimer
                  </Button>

                  <Button
                    onClick={copyQRToClipboard}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copier l'image
                  </Button>
                </div>

                {/* Partage sur réseaux sociaux */}
                <div className="space-y-3 pt-4 border-t">
                  <h3 className="font-semibold text-gray-900">Partager</h3>
                  
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600 mb-2">Partager le QR code seul:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={shareQRWhatsApp}
                        className="bg-green-500 hover:bg-green-600 text-white text-xs"
                        size="sm"
                      >
                        <Share2 className="mr-1 h-3 w-3" />
                        WhatsApp
                      </Button>

                      <Button
                        onClick={shareFacebook}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                        size="sm"
                      >
                        <Share2 className="mr-1 h-3 w-3" />
                        Facebook
                      </Button>

                      <Button
                        onClick={shareTwitter}
                        className="bg-sky-500 hover:bg-sky-600 text-white text-xs"
                        size="sm"
                      >
                        <Share2 className="mr-1 h-3 w-3" />
                        Twitter
                      </Button>

                      <Button
                        onClick={shareEmail}
                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs"
                        size="sm"
                      >
                        <Share2 className="mr-1 h-3 w-3" />
                        Email
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Copier URL */}
                <div className="pt-4 border-t">
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        Copié!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copier l'URL
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne droite - Aperçu */}
          <div>
            <Card className="shadow-lg sticky top-6">
              <CardHeader>
                <CardTitle>Aperçu</CardTitle>
                <CardDescription>Votre QR code généré</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <div
                  ref={qrRef}
                  className="p-4 bg-white rounded-lg shadow-md border-2 border-gray-200"
                >
                  <QRCode
                    value={url}
                    size={256}
                    level="H"
                    includeMargin={true}
                    fgColor="#000000"
                    bgColor="#ffffff"
                  />
                </div>

                {/* Informations */}
                <div className="mt-8 w-full space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">URL encodée:</span>
                    </p>
                    <p className="text-xs text-blue-600 break-all mt-1 font-mono">
                      {url}
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">✓ Prêt à partager</span>
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Téléchargez, imprimez ou partagez votre QR code
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Conseils d'utilisation */}
        <Card className="mt-8 bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900">💡 Conseils d'utilisation</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-amber-900 space-y-2">
            <p>• Imprimez le QR code sur vos affiches publicitaires et matériaux marketing</p>
            <p>• Partagez le QR code sur vos réseaux sociaux pour augmenter le trafic</p>
            <p>• Utilisez le QR code dans vos emails et newsletters</p>
            <p>• Testez le QR code avec votre téléphone avant de le distribuer</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
