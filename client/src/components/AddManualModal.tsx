import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';

interface AddManualModalProps {
  onSuccess?: () => void;
}

export function AddManualModal({ onSuccess }: AddManualModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '1', // Default to first category
    educationLevelId: '',
    educationClassId: '',
    coverImageUrl: '',
  });

  const [educationLevels, setEducationLevels] = useState<any[]>([]);
  const [educationClasses, setEducationClasses] = useState<any[]>([]);

  // Fetch education levels
  const { data: levels } = trpc.manuals.getLevels.useQuery();

  // Fetch classes when level changes
  const { data: classes } = trpc.manuals.getClassesByLevel.useQuery(
    { levelId: parseInt(formData.educationLevelId) },
    { enabled: !!formData.educationLevelId }
  );

  const createManualMutation = trpc.manuals.createManual.useMutation();

  useEffect(() => {
    if (levels) {
      setEducationLevels(levels);
    }
  }, [levels]);

  useEffect(() => {
    if (classes) {
      setEducationClasses(classes);
      // Reset class selection when level changes
      setFormData(prev => ({ ...prev, educationClassId: '' }));
    }
  }, [classes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createManualMutation.mutateAsync({
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        coverImageUrl: formData.coverImageUrl,
        educationLevelId: formData.educationLevelId ? parseInt(formData.educationLevelId) : undefined,
        educationClassId: formData.educationClassId ? parseInt(formData.educationClassId) : undefined,
      });

      toast.success('Manuel ajouté avec succès!');
      setFormData({
        title: '',
        author: '',
        isbn: '',
        description: '',
        price: '',
        stock: '',
        categoryId: '1',
        educationLevelId: '',
        educationClassId: '',
        coverImageUrl: '',
      });
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'ajout du manuel');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Ajouter un Manuel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajouter un Nouveau Manuel</DialogTitle>
          <DialogDescription>
            Remplissez les informations du manuel scolaire
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre du Manuel *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ex: Mathématiques 6ème"
              required
            />
          </div>

          {/* Author */}
          <div className="space-y-2">
            <Label htmlFor="author">Auteur *</Label>
            <Input
              id="author"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              placeholder="Ex: Jean Dupont"
              required
            />
          </div>

          {/* ISBN */}
          <div className="space-y-2">
            <Label htmlFor="isbn">ISBN</Label>
            <Input
              id="isbn"
              name="isbn"
              value={formData.isbn}
              onChange={handleInputChange}
              placeholder="Ex: 978-2-123456-78-9"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Décrivez le manuel..."
              rows={3}
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Prix (FCFA) *</Label>
            <Input
              id="price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Ex: 15000"
              step="0.01"
              required
            />
          </div>

          {/* Stock */}
          <div className="space-y-2">
            <Label htmlFor="stock">Stock *</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleInputChange}
              placeholder="Ex: 50"
              required
            />
          </div>

          {/* Education Level */}
          <div className="space-y-2">
            <Label htmlFor="educationLevelId">Niveau d'Éducation</Label>
            <Select
              value={formData.educationLevelId}
              onValueChange={(value) => handleSelectChange('educationLevelId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un niveau" />
              </SelectTrigger>
              <SelectContent>
                {educationLevels.map((level) => (
                  <SelectItem key={level.id} value={level.id.toString()}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Education Class */}
          {formData.educationLevelId && (
            <div className="space-y-2">
              <Label htmlFor="educationClassId">Classe d'Éducation</Label>
              <Select
                value={formData.educationClassId}
                onValueChange={(value) => handleSelectChange('educationClassId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une classe" />
                </SelectTrigger>
                <SelectContent>
                  {educationClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Cover Image URL */}
          <div className="space-y-2">
            <Label htmlFor="coverImageUrl">URL de la Couverture</Label>
            <Input
              id="coverImageUrl"
              name="coverImageUrl"
              value={formData.coverImageUrl}
              onChange={handleInputChange}
              placeholder="https://..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={createManualMutation.isPending}
              className="flex items-center gap-2"
            >
              {createManualMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Ajouter le Manuel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
