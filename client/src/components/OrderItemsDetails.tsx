import { trpc } from "@/lib/trpc";
import { Loader2, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface OrderItemsDetailsProps {
  orderId: number;
}

export function OrderItemsDetails({ orderId }: OrderItemsDetailsProps) {
  const { data: items, isLoading, error } = trpc.orders.getItems.useQuery(
    { orderId },
    { enabled: !!orderId }
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Produits Commandés
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Produits Commandés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-sm">Erreur: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Produits Commandés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">Aucun produit trouvé pour cette commande</div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total
  const total = items.reduce((sum, item) => {
    const subtotal = parseFloat(item.subtotal.toString());
    return sum + subtotal;
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Produits Commandés
        </CardTitle>
        <CardDescription>
          {items.length} produit{items.length > 1 ? "s" : ""} - Total: {total.toLocaleString("fr-CI", {
            style: "currency",
            currency: "XOF",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead className="text-right">Quantité</TableHead>
                <TableHead className="text-right">Prix Unitaire</TableHead>
                <TableHead className="text-right">Sous-total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {item.product.coverImageUrl && (
                        <img
                          src={item.product.coverImageUrl}
                          alt={item.product.title}
                          className="w-10 h-14 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium">{item.product.title}</div>
                        {item.product.isbn && (
                          <div className="text-xs text-muted-foreground">ISBN: {item.product.isbn}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{item.product.author}</TableCell>
                  <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {parseFloat(item.unitPrice.toString()).toLocaleString("fr-CI", {
                      style: "currency",
                      currency: "XOF",
                    })}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {parseFloat(item.subtotal.toString()).toLocaleString("fr-CI", {
                      style: "currency",
                      currency: "XOF",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-6 flex justify-end">
          <div className="w-64 space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span>Sous-total:</span>
              <span>
                {total.toLocaleString("fr-CI", {
                  style: "currency",
                  currency: "XOF",
                })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
