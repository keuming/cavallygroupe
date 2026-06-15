import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Edit2, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EditManualModal } from './EditManualModal';

export function ManualsList() {
  const [selectedManualForDelete, setSelectedManualForDelete] = useState<number | null>(null);
  const [selectedManualForEdit, setSelectedManualForEdit] = useState<any | null>(null);

  // Fetch vendor manuals
  const { data: manuals, isLoading, refetch } = trpc.manuals.getVendorManuals.useQuery();

  // Delete mutation
  const deleteManualMutation = trpc.manuals.deleteManual.useMutation();

  const handleDelete = async (id: number) => {
    try {
      await deleteManualMutation.mutateAsync({ id });
      toast.success('Manuel supprimé avec succès!');
      setSelectedManualForDelete(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression du manuel');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!manuals || manuals.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-600">Aucun manuel trouvé</p>
            <p className="text-sm text-gray-500 mt-1">Commencez par ajouter votre premier manuel</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {manuals.map((manual: any) => (
        <Card key={manual.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              {/* Left side - Manual info */}
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{manual.title}</h3>
                <p className="text-sm text-gray-600 mt-1">Auteur: {manual.author}</p>
                
                {manual.isbn && (
                  <p className="text-sm text-gray-600">ISBN: {manual.isbn}</p>
                )}

                {manual.description && (
                  <p className="text-sm text-gray-700 mt-2 line-clamp-2">{manual.description}</p>
                )}

                <div className="flex gap-6 mt-3 text-sm">
                  <div>
                    <span className="text-gray-600">Prix: </span>
                    <span className="font-semibold text-gray-900">{manual.price} FCFA</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Stock: </span>
                    <span className={`font-semibold ${
                      manual.stock > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {manual.stock}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right side - Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedManualForEdit(manual)}
                  className="flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Modifier
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setSelectedManualForDelete(manual.id)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!selectedManualForDelete} onOpenChange={(open) => {
        if (!open) setSelectedManualForDelete(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le manuel?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Le manuel sera supprimé définitivement de votre catalogue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedManualForDelete && handleDelete(selectedManualForDelete)}
              disabled={deleteManualMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteManualMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit modal */}
      {selectedManualForEdit && (
        <EditManualModal
          manual={selectedManualForEdit}
          onClose={() => setSelectedManualForEdit(null)}
          onSuccess={() => {
            setSelectedManualForEdit(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
