import { ID, OAuthProvider, Query } from "appwrite";
import { getAccount, getDatabase, appwriteConfig } from "~/appwrite/client";
import { redirect } from "react-router";
import * as Sentry from "@sentry/react-router";

export const getExistingUser = async (id: string) => {
    try {
        const { documents, total } = await getDatabase().listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", id)]
        );
        return total > 0 ? documents[0] : null;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

export const storeUserData = async () => {
    try {
        const user = await getAccount().get();
        if (!user) throw new Error("User not found");

        const { providerAccessToken } = (await getAccount().getSession("current")) || {};
        const profilePicture = providerAccessToken
            ? await getGooglePicture(providerAccessToken)
            : null;

        const createdUser = await getDatabase().createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                accountId: user.$id,
                email: user.email,
                name: user.name,
                imageUrl: profilePicture,
                joinedAt: new Date().toISOString(),
            }
        );

        if (!createdUser.$id) return redirect("/sign-in");

        Sentry.setUser({
            id: createdUser.$id,
            email: user.email,
            name: user.name,
        });
    } catch (error) {
        Sentry.captureException(error as Error, {
            tags: { location: "storeUserData" },
        });
        console.error("Error storing user data:", error);
    }
};

const getGooglePicture = async (accessToken: string) => {
    try {
        const response = await fetch(
            "https://people.googleapis.com/v1/people/me?personFields=photos",
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!response.ok) throw new Error("Failed to fetch Google profile picture");

        const { photos } = await response.json();
        return photos?.[0]?.url || null;
    } catch (error) {
        console.error("Error fetching Google picture:", error);
        return null;
    }
};

export const loginWithGoogle = async () => {
    try {
        getAccount().createOAuth2Session(
            OAuthProvider.Google,
            `${window.location.origin}/`,
            `${window.location.origin}/404`
        );
    } catch (error) {
        console.error("Error during OAuth2 session creation:", error);
    }
};

export const logoutUser = async () => {
    try {
        await getAccount().deleteSession("current");
        Sentry.setUser(null);
    } catch (error) {
        Sentry.captureException(error as Error, {
            tags: { location: "logoutUser" },
        });
        console.error("Error during logout:", error);
    }
};

export const getUser = async () => {
    try {
        const user = await getAccount().get();
        if (!user) return redirect("/sign-in");

        const { documents } = await getDatabase().listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [
                Query.equal("accountId", user.$id),
                Query.select(["name", "email", "imageUrl", "joinedAt", "accountId"]),
            ]
        );

        const userData = documents.length > 0 ? documents[0] as unknown as UserData : (redirect("/sign-in") as unknown as UserData);

        Sentry.setUser({
            id: userData.$id,
            email: userData.email,
            name: userData.name,
        });

        return userData;
    } catch (error) {
        Sentry.captureException(error as Error, {
            tags: { location: "getUser" },
        });
        console.error("Error fetching user:", error);
        return null;
    }
};

export const getAllUsers = async (limit: number, offset: number) => {
    try {
        const { documents: users, total } = await getDatabase().listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.limit(limit), Query.offset(offset)]
        )

        if(total === 0) return { users: [], total };

        return { users, total };
    } catch (e) {
        console.log('Error fetching users')
        return { users: [], total: 0 }
    }
}