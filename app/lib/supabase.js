import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
};

// Get current user
export const getCurrentUser = async () => {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
        console.error('Error getting user:', error);
        return null;
    }
    return user;
};

// Sign up with email/password
export const signUp = async (email, password) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        return { user: null, error: error.message };
    }
    return { user: data.user, error: null };
};

// Sign in with email/password
export const signIn = async (email, password) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { user: null, error: error.message };
    }
    return { user: data.user, error: null };
};

// Sign out
export const signOut = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error signing out:', error);
        return false;
    }
    return true;
};

// Reset password (send email)
export const resetPassword = async (email) => {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
        return { success: false, error: error.message };
    }
    return { success: true, error: null };
};

// Listen to auth changes
export const onAuthStateChange = (callback) => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
            callback(event, session);
        }
    );
    return subscription;
};
