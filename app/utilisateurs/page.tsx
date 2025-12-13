"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { SectionTitle, Button, Table, TableRow, TableCell, Badge, Select, ConfirmModal } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { getAllUsers, updateUserRole, toggleUserStatus, deleteUser } from "@/lib/firebase/users";
import { User, UserRole } from "@/lib/lots/types";
import { useToast } from "@/components/ui";
import { Plus, Edit, Trash2, Power } from "lucide-react";

export default function UtilisateursPage() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const router = useRouter();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<{ user: User; action: string } | null>(null);
  const [newRole, setNewRole] = useState<UserRole>("imrep");

  useEffect(() => {
    if (authLoading || roleLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (role !== "allianz") {
      router.push("/dashboard");
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const allUsers = await getAllUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
        showToast("Erreur lors du chargement des utilisateurs", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, role, authLoading, roleLoading, router, showToast]);

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    try {
      await updateUserRole(selectedUser.user.id, newRole);
      showToast("Rôle mis à jour avec succès", "success");
      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);
      setSelectedUser(null);
    } catch (error: any) {
      showToast(error.message || "Erreur lors de la mise à jour", "error");
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserStatus(userId, !currentStatus);
      showToast(`Utilisateur ${!currentStatus ? "activé" : "désactivé"}`, "success");
      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);
    } catch (error: any) {
      showToast(error.message || "Erreur lors de la modification", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteUser(selectedUser.user.id);
      showToast("Utilisateur supprimé", "success");
      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);
      setSelectedUser(null);
    } catch (error: any) {
      showToast(error.message || "Erreur lors de la suppression", "error");
    }
  };

  if (authLoading || roleLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-base text-[#475569]">Chargement...</p>
        </div>
      </DashboardLayout>
    );
  }

  const isRootAdmin = (userEmail: string) => userEmail === "jeanmichel@allianz-nogaro.fr";

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-[24px]">
        <SectionTitle>Gestion des utilisateurs</SectionTitle>
        <Button variant="primary">
          <Plus size={18} className="mr-2" />
          Créer un utilisateur
        </Button>
      </div>

      <Table headers={["Email", "Rôle", "Statut", "Actions"]}>
        {users.map((u) => {
          const isProtected = isRootAdmin(u.email);
          return (
            <TableRow key={u.id}>
              <TableCell className="font-medium">{u.email}</TableCell>
              <TableCell>
                <Badge type={u.role === "allianz" ? "info" : "success"}>
                  {u.role === "allianz" ? "Allianz" : "IMREP"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge type={u.isActive ? "success" : "warning"}>
                  {u.isActive ? "Actif" : "Inactif"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {!isProtected && (
                    <>
                      <Button
                        variant="secondary"
                        className="p-2"
                        onClick={() => {
                          setSelectedUser({ user: u, action: "role" });
                          setNewRole(u.role);
                        }}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="secondary"
                        className="p-2"
                        onClick={() => handleToggleStatus(u.id, u.isActive)}
                      >
                        <Power size={16} />
                      </Button>
                      <Button
                        variant="danger"
                        className="p-2"
                        onClick={() => setSelectedUser({ user: u, action: "delete" })}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </>
                  )}
                  {isProtected && (
                    <span className="text-sm text-[#64748b]">Protégé</span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </Table>

      {selectedUser?.action === "role" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-[10px] p-6 max-w-md w-full mx-4 shadow-lg">
            <h3 className="text-[20px] font-semibold text-[#1e293b] mb-4">
              Modifier le rôle
            </h3>
            <Select
              label="Nouveau rôle"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
              className="mb-4"
            >
              <option value="imrep">IMREP</option>
              <option value="allianz">Allianz</option>
            </Select>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setSelectedUser(null)}>
                Annuler
              </Button>
              <Button variant="primary" onClick={handleUpdateRole}>
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedUser?.action === "delete" && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setSelectedUser(null)}
          onConfirm={handleDelete}
          title="Supprimer l'utilisateur"
          message={`Êtes-vous sûr de vouloir supprimer l'utilisateur ${selectedUser.user.email} ?`}
          variant="danger"
        />
      )}
    </DashboardLayout>
  );
}

