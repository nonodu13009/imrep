import { NextResponse } from "next/server";
import { createUserWithAdmin } from "@/lib/firebase/admin-actions";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { UserRole } from "@/lib/lots/types";

/**
 * API Route pour créer un nouvel utilisateur
 * Nécessite une authentification avec le rôle "allianz"
 */
export async function POST(request: Request) {
  try {
    // Récupérer les données de la requête
    const body = await request.json();
    const { email, password, role, displayName, idToken } = body;

    // Vérifier l'authentification
    if (!idToken) {
      return NextResponse.json(
        { success: false, error: "Token d'authentification requis" },
        { status: 401 }
      );
    }

    let decodedToken;
    try {
      const adminAuth = getAdminAuth();
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error: any) {
      console.error("[API Create User] Erreur de vérification du token:", error);
      return NextResponse.json(
        { success: false, error: "Token invalide ou expiré" },
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;

    // Vérifier que l'utilisateur a le rôle "allianz" via Firestore
    const adminDb = getAdminDb();
    const userDoc = await adminDb.collection("users").doc(uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const userRole = userData?.role;

    if (userRole !== "allianz") {
      return NextResponse.json(
        { success: false, error: "Accès refusé. Seuls les utilisateurs Allianz peuvent créer des utilisateurs." },
        { status: 403 }
      );
    }

    // Validation des données
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Email invalide" },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    if (!role || (role !== "imrep" && role !== "allianz")) {
      return NextResponse.json(
        { success: false, error: "Rôle invalide. Doit être 'imrep' ou 'allianz'" },
        { status: 400 }
      );
    }

    // Créer l'utilisateur
    const result = await createUserWithAdmin(
      email,
      password,
      role as UserRole,
      displayName
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("[API Create User] Erreur:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors de la création de l'utilisateur",
      },
      { status: 500 }
    );
  }
}

