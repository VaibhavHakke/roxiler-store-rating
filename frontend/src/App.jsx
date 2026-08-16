import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";


/* =========================================================
   COMMON HELPERS
========================================================= */

const getToken = () =>
    localStorage.getItem("token");

const getSavedUser = () => {
    try {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    } catch {
        return null;
    }
};


const getResponseData = (data) => {

    if (Array.isArray(data)) {
        return data;
    }

    return (
        data?.data ||
        data?.users ||
        data?.stores ||
        data?.results ||
        []
    );
};


const apiRequest = async (
    endpoint,
    options = {}
) => {

    const token = getToken();

    const headers = {
        ...(options.body
            ? {
                "Content-Type": "application/json"
            }
            : {}),

        ...(token
            ? {
                Authorization:
                    `Bearer ${token}`
            }
            : {}),

        ...(options.headers || {})
    };


    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,
            headers
        }
    );


    let data = {};

    try {
        data = await response.json();
    } catch {
        data = {};
    }


    if (!response.ok) {
        throw new Error(
            data.message ||
            "Request failed"
        );
    }


    return data;
};


/* =========================================================
   VALIDATION
========================================================= */

const validateName = (name) => {

    if (name.length < 20) {
        return "Name must contain at least 20 characters.";
    }

    if (name.length > 60) {
        return "Name cannot exceed 60 characters.";
    }

    return "";
};


const validateAddress = (address) => {

    if (address.length > 400) {
        return "Address cannot exceed 400 characters.";
    }

    return "";
};


const validateEmail = (email) => {

    const pattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!pattern.test(email)) {
        return "Enter a valid email address.";
    }

    return "";
};


const validatePassword = (password) => {

    if (
        password.length < 8 ||
        password.length > 16
    ) {
        return "Password must be 8-16 characters.";
    }

    if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter.";
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
        return "Password must contain at least one special character.";
    }

    return "";
};


/* =========================================================
   APP
========================================================= */

function App() {

    const [token, setToken] =
        useState(getToken());

    const [user, setUser] =
        useState(getSavedUser());


    const handleLogin = (
        loginToken,
        loginUser
    ) => {

        localStorage.setItem(
            "token",
            loginToken
        );

        localStorage.setItem(
            "user",
            JSON.stringify(loginUser)
        );

        setToken(loginToken);
        setUser(loginUser);
    };


    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
    };


    if (!token || !user) {

        return (
            <LoginPage
                onLogin={handleLogin}
            />
        );
    }


    if (user.role === "ADMIN") {

        return (
            <AdminDashboard
                user={user}
                onLogout={handleLogout}
            />
        );
    }


    if (
        user.role ===
        "STORE_OWNER"
    ) {

        return (
            <StoreOwnerDashboard
                user={user}
                onLogout={handleLogout}
            />
        );
    }


    return (
        <UserDashboard
            user={user}
            onLogout={handleLogout}
        />
    );
}


/* =========================================================
   LOGIN
========================================================= */

function LoginPage({
    onLogin
}) {

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [showSignup, setShowSignup] =
        useState(false);

    const [showForgotPassword, setShowForgotPassword] =
        useState(false);


    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setLoading(true);


        try {

            const data =
                await apiRequest(
                    "/api/auth/login",
                    {
                        method: "POST",

                        body: JSON.stringify({
                            email,
                            password
                        })
                    }
                );


            const token =
                data.token ||
                data.data?.token;

            const loggedUser =
                data.user ||
                data.data?.user;


            if (!token || !loggedUser) {

                throw new Error(
                    "Login response does not contain user or token."
                );
            }


            onLogin(
                token,
                loggedUser
            );

        } catch (error) {

            setError(
                error.message
            );

        } finally {

            setLoading(false);
        }
    };


    if (showSignup) {

        return (
            <SignupPage
                onBack={() =>
                    setShowSignup(false)
                }
            />
        );
    }


    if (showForgotPassword) {

        return (
            <ForgotPasswordPage
                onBack={() =>
                    setShowForgotPassword(false)
                }
            />
        );
    }


    return (
        <div className="auth-page">

            <div className="auth-card">

                <div className="brand">

                    <div className="brand-mark">
                        SR
                    </div>

                    <div>
                        <h1>
                            Store Rating
                        </h1>

                        <p>
                            Roxiler Full Stack Challenge
                        </p>
                    </div>

                </div>


                <h2>
                    Sign in
                </h2>

                <p className="muted">
                    Access your account
                </p>


                <form
                    onSubmit={handleSubmit}
                >

                    <Field
                        label="Email"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        placeholder="Enter email"
                        required
                    />


                    <PasswordField
                        label="Password"
                        value={password}
                        onChange={setPassword}
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                        placeholder="Enter password"
                        required
                    />


                    <div className="forgot-row">

                        <button
                            type="button"
                            className="link-button"
                            onClick={() =>
                                setShowForgotPassword(
                                    true
                                )
                            }
                        >
                            Forgot password?
                        </button>

                    </div>


                    {error && (
                        <Alert
                            type="error"
                            message={error}
                        />
                    )}


                    <button
                        className="primary full"
                        disabled={loading}
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign in"}
                    </button>

                </form>


                <div className="auth-footer">

                    <span>
                        Don't have an account?
                    </span>

                    <button
                        className="link-button"
                        onClick={() =>
                            setShowSignup(true)
                        }
                    >
                        Create normal user account
                    </button>

                </div>

            </div>

        </div>
    );
}


/* =========================================================
   FORGOT PASSWORD
========================================================= */

function ForgotPasswordPage({
    onBack
}) {

    const [step, setStep] =
        useState(1);

    const [email, setEmail] =
        useState("");

    const [otp, setOtp] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [showNewPassword, setShowNewPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    /* -----------------------------------------
       STEP 1
       SEND OTP
    ----------------------------------------- */

    const sendOtp = async (event) => {

        event.preventDefault();

        setError("");
        setMessage("");


        const emailError =
            validateEmail(email);

        if (emailError) {

            setError(
                emailError
            );

            return;
        }


        setLoading(true);


        try {

            const response =
                await apiRequest(
                    "/api/auth/forgot-password",
                    {
                        method: "POST",

                        body: JSON.stringify({
                            email
                        })
                    }
                );


            setMessage(
                response.message ||
                "Verification code sent to your email."
            );

            setStep(2);

        } catch (error) {

            setError(
                error.message
            );

        } finally {

            setLoading(false);
        }
    };


    /* -----------------------------------------
       STEP 2
       VERIFY OTP
    ----------------------------------------- */

    const verifyOtp = async (event) => {

        event.preventDefault();

        setError("");
        setMessage("");


        if (!/^\d{6}$/.test(otp)) {

            setError(
                "Enter the 6-digit verification code."
            );

            return;
        }


        setLoading(true);


        try {

            const response =
                await apiRequest(
                    "/api/auth/verify-reset-otp",
                    {
                        method: "POST",

                        body: JSON.stringify({
                            email,
                            otp
                        })
                    }
                );


            setMessage(
                response.message ||
                "Email verified successfully."
            );

            setStep(3);

        } catch (error) {

            setError(
                error.message
            );

        } finally {

            setLoading(false);
        }
    };


    /* -----------------------------------------
       STEP 3
       RESET PASSWORD
    ----------------------------------------- */

    const resetPassword = async (event) => {

        event.preventDefault();

        setError("");
        setMessage("");


        const passwordError =
            validatePassword(
                newPassword
            );

        if (passwordError) {

            setError(
                passwordError
            );

            return;
        }


        if (
            newPassword !==
            confirmPassword
        ) {

            setError(
                "New password and confirm password must match."
            );

            return;
        }


        setLoading(true);


        try {

            const response =
                await apiRequest(
                    "/api/auth/reset-password",
                    {
                        method: "POST",

                        body: JSON.stringify({
                            email,
                            otp,
                            newPassword
                        })
                    }
                );


            setMessage(
                response.message ||
                "Password changed successfully."
            );


            setTimeout(() => {

                onBack();

            }, 1200);

        } catch (error) {

            setError(
                error.message
            );

        } finally {

            setLoading(false);
        }
    };


    return (
        <div className="auth-page">

            <div className="auth-card">

                <div className="page-top">

                    <div>

                        <h1>
                            Reset Password
                        </h1>

                        <p className="muted">
                            Verify your email and create a new password
                        </p>

                    </div>

                </div>


                <div className="steps">

                    <div
                        className={
                            step >= 1
                                ? "step active"
                                : "step"
                        }
                    >
                        1
                    </div>

                    <div className="step-line" />

                    <div
                        className={
                            step >= 2
                                ? "step active"
                                : "step"
                        }
                    >
                        2
                    </div>

                    <div className="step-line" />

                    <div
                        className={
                            step >= 3
                                ? "step active"
                                : "step"
                        }
                    >
                        3
                    </div>

                </div>


                {step === 1 && (

                    <form
                        onSubmit={sendOtp}
                    >

                        <h3>
                            Verify your email
                        </h3>

                        <p className="muted">
                            Enter your registered email address.
                            We will send a 6-digit verification code.
                        </p>


                        <Field
                            label="Email"
                            type="email"
                            value={email}
                            onChange={setEmail}
                            placeholder="name@example.com"
                            required
                        />


                        {error && (
                            <Alert
                                type="error"
                                message={error}
                            />
                        )}


                        <button
                            className="primary full"
                            disabled={loading}
                        >
                            {loading
                                ? "Sending..."
                                : "Send verification code"}
                        </button>

                    </form>

                )}


                {step === 2 && (

                    <form
                        onSubmit={verifyOtp}
                    >

                        <h3>
                            Enter verification code
                        </h3>

                        <p className="muted">
                            We sent a 6-digit code to:
                        </p>

                        <strong>
                            {email}
                        </strong>


                        <Field
                            label="Verification Code"
                            value={otp}
                            onChange={(value) =>
                                setOtp(
                                    value
                                        .replace(
                                            /\D/g,
                                            ""
                                        )
                                        .slice(
                                            0,
                                            6
                                        )
                                )
                            }
                            placeholder="Enter 6-digit code"
                            required
                        />


                        {message && (
                            <Alert
                                type="success"
                                message={message}
                            />
                        )}


                        {error && (
                            <Alert
                                type="error"
                                message={error}
                            />
                        )}


                        <button
                            className="primary full"
                            disabled={loading}
                        >
                            {loading
                                ? "Verifying..."
                                : "Verify email"}
                        </button>


                        <button
                            type="button"
                            className="secondary full"
                            onClick={() =>
                                setStep(1)
                            }
                        >
                            Change email
                        </button>

                    </form>

                )}


                {step === 3 && (

                    <form
                        onSubmit={resetPassword}
                    >

                        <h3>
                            Create new password
                        </h3>

                        <p className="muted">
                            Choose a new password for your account.
                        </p>


                        <PasswordField
                            label="New Password"
                            value={newPassword}
                            onChange={setNewPassword}
                            showPassword={showNewPassword}
                            setShowPassword={
                                setShowNewPassword
                            }
                            placeholder="8-16 characters"
                            required
                        />


                        <PasswordField
                            label="Confirm New Password"
                            value={confirmPassword}
                            onChange={
                                setConfirmPassword
                            }
                            showPassword={
                                showConfirmPassword
                            }
                            setShowPassword={
                                setShowConfirmPassword
                            }
                            placeholder="Repeat new password"
                            required
                        />


                        <p className="password-rule">
                            8-16 characters, at least one
                            uppercase letter and one special
                            character.
                        </p>


                        {message && (
                            <Alert
                                type="success"
                                message={message}
                            />
                        )}


                        {error && (
                            <Alert
                                type="error"
                                message={error}
                            />
                        )}


                        <button
                            className="primary full"
                            disabled={loading}
                        >
                            {loading
                                ? "Changing..."
                                : "Change password"}
                        </button>

                    </form>

                )}


                <button
                    className="link-button back-login"
                    onClick={onBack}
                >
                    ← Back to login
                </button>

            </div>

        </div>
    );
}


/* =========================================================
   SIGNUP
========================================================= */

function SignupPage({
    onBack
}) {

    const [form, setForm] =
        useState({
            name: "",
            email: "",
            address: "",
            password: ""
        });

    const [showPassword, setShowPassword] =
        useState(false);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    const updateField = (
        field,
        value
    ) => {

        setForm({
            ...form,
            [field]: value
        });
    };


    const submit = async (event) => {

        event.preventDefault();

        setError("");
        setMessage("");


        const validationError =
            validateName(form.name) ||
            validateEmail(form.email) ||
            validateAddress(form.address) ||
            validatePassword(
                form.password
            );


        if (validationError) {

            setError(
                validationError
            );

            return;
        }


        setLoading(true);


        try {

            await apiRequest(
                "/api/auth/register",
                {
                    method: "POST",

                    body: JSON.stringify({
                        name: form.name,
                        email: form.email,
                        address: form.address,
                        password:
                            form.password
                    })
                }
            );


            setMessage(
                "Registration successful. You can now sign in."
            );


            setForm({
                name: "",
                email: "",
                address: "",
                password: ""
            });

        } catch (error) {

            setError(
                error.message
            );

        } finally {

            setLoading(false);
        }
    };


    return (
        <div className="auth-page">

            <div className="auth-card wide">

                <div className="page-top">

                    <div>

                        <h1>
                            Create Account
                        </h1>

                        <p className="muted">
                            Normal user registration
                        </p>

                    </div>

                    <button
                        className="secondary"
                        onClick={onBack}
                    >
                        Back
                    </button>

                </div>


                <form
                    onSubmit={submit}
                >

                    <Field
                        label="Full Name"
                        value={form.name}
                        onChange={(value) =>
                            updateField(
                                "name",
                                value
                            )
                        }
                        placeholder="Minimum 20 characters"
                        required
                    />


                    <Field
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={(value) =>
                            updateField(
                                "email",
                                value
                            )
                        }
                        placeholder="name@example.com"
                        required
                    />


                    <label>
                        Address
                    </label>

                    <textarea
                        value={form.address}
                        onChange={(event) =>
                            updateField(
                                "address",
                                event.target.value
                            )
                        }
                        placeholder="Enter address"
                        maxLength={400}
                        required
                    />

                    <div className="field-hint">
                        {form.address.length}/400
                    </div>


                    <PasswordField
                        label="Password"
                        value={form.password}
                        onChange={(value) =>
                            updateField(
                                "password",
                                value
                            )
                        }
                        showPassword={showPassword}
                        setShowPassword={
                            setShowPassword
                        }
                        placeholder="8-16 characters"
                        required
                    />


                    {error && (
                        <Alert
                            type="error"
                            message={error}
                        />
                    )}


                    {message && (
                        <Alert
                            type="success"
                            message={message}
                        />
                    )}


                    <button
                        className="primary full"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating..."
                            : "Create account"}
                    </button>

                </form>

            </div>

        </div>
    );
}


/* =========================================================
   ADMIN
========================================================= */

function AdminDashboard({
    user,
    onLogout
}) {

    const [activeTab, setActiveTab] =
        useState("dashboard");


    return (
        <DashboardLayout
            title="Admin Panel"
            user={user}
            onLogout={onLogout}
            tabs={[
                ["dashboard", "Dashboard"],
                ["users", "Users"],
                ["stores", "Stores"],
                ["addUser", "Add User"],
                ["addStore", "Add Store"]
            ]}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
        >

            {activeTab === "dashboard" && (
                <AdminOverview />
            )}

            {activeTab === "users" && (
                <AdminUsers />
            )}

            {activeTab === "stores" && (
                <AdminStores />
            )}

            {activeTab === "addUser" && (
                <AdminAddUser />
            )}

            {activeTab === "addStore" && (
                <AdminAddStore />
            )}

        </DashboardLayout>
    );
}


/* =========================================================
   ADMIN OVERVIEW
========================================================= */

function AdminOverview() {

    const [users, setUsers] =
        useState([]);

    const [stores, setStores] =
        useState([]);

    const [ratings, setRatings] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {
        load();
    }, []);


    const load = async () => {

        try {

            const [
                usersResponse,
                storesResponse
            ] = await Promise.all([
                apiRequest(
                    "/api/admin/users"
                ),
                apiRequest(
                    "/api/admin/stores"
                )
            ]);


            const userList =
                getResponseData(
                    usersResponse
                );

            const storeList =
                getResponseData(
                    storesResponse
                );


            setUsers(userList);
            setStores(storeList);


            try {

                const dashboard =
                    await apiRequest(
                        "/api/admin/dashboard"
                    );

                setRatings(
                    dashboard.data
                        ?.totalRatings ??
                    dashboard.totalRatings ??
                    null
                );

            } catch {

                const calculated =
                    storeList.reduce(
                        (
                            sum,
                            store
                        ) =>
                            sum +
                            Number(
                                store.total_ratings ||
                                store.totalRatings ||
                                0
                            ),
                        0
                    );

                setRatings(
                    calculated
                );
            }

        } catch (error) {

            setError(
                error.message
            );

        } finally {

            setLoading(false);
        }
    };


    if (loading) {
        return <Loading />;
    }


    return (
        <div>

            <PageTitle
                title="Dashboard"
                description="System overview"
            />


            {error && (
                <Alert
                    type="error"
                    message={error}
                />
            )}


            <div className="stats-grid">

                <StatCard
                    title="Total Users"
                    value={users.length}
                />

                <StatCard
                    title="Total Stores"
                    value={stores.length}
                />

                <StatCard
                    title="Submitted Ratings"
                    value={
                        ratings === null
                            ? "-"
                            : ratings
                    }
                />

            </div>


            <div className="panel">

                <h3>
                    Quick Summary
                </h3>

                <p className="muted">
                    Manage users, stores and submitted
                    ratings from the sections above.
                </p>

            </div>

        </div>
    );
}


/* =========================================================
   ADMIN USERS
========================================================= */

function AdminUsers() {

    const [users, setUsers] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [role, setRole] =
        useState("");

    const [sort, setSort] =
        useState({
            field: "name",
            direction: "asc"
        });

    const [selectedUser, setSelectedUser] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {
        loadUsers();
    }, []);


    const loadUsers = async () => {

        try {

            const data =
                await apiRequest(
                    "/api/admin/users"
                );

            setUsers(
                getResponseData(data)
            );

        } catch (error) {

            setError(
                error.message
            );

        } finally {

            setLoading(false);
        }
    };


    const filteredUsers =
        useMemo(() => {

            const value =
                search
                    .toLowerCase()
                    .trim();


            return [...users]
                .filter((item) => {

                    if (
                        role &&
                        item.role !== role
                    ) {
                        return false;
                    }

                    if (!value) {
                        return true;
                    }

                    return (
                        String(
                            item.name || ""
                        )
                            .toLowerCase()
                            .includes(value) ||

                        String(
                            item.email || ""
                        )
                            .toLowerCase()
                            .includes(value) ||

                        String(
                            item.address || ""
                        )
                            .toLowerCase()
                            .includes(value)
                    );
                })
                .sort((a, b) => {

                    const first =
                        String(
                            a[sort.field] || ""
                        ).toLowerCase();

                    const second =
                        String(
                            b[sort.field] || ""
                        ).toLowerCase();

                    return sort.direction ===
                        "asc"
                        ? first.localeCompare(
                            second
                        )
                        : second.localeCompare(
                            first
                        );
                });

        }, [
            users,
            search,
            role,
            sort
        ]);


    const changeSort = (field) => {

        setSort((current) => ({
            field,

            direction:
                current.field === field &&
                current.direction === "asc"
                    ? "desc"
                    : "asc"
        }));
    };


    return (
        <div>

            <PageTitle
                title="Users"
                description="View and manage registered users"
            />


            {error && (
                <Alert
                    type="error"
                    message={error}
                />
            )}


            <div className="filters">

                <input
                    placeholder="Search name, email or address"
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                />

                <select
                    value={role}
                    onChange={(e) =>
                        setRole(
                            e.target.value
                        )
                    }
                >

                    <option value="">
                        All Roles
                    </option>

                    <option value="USER">
                        USER
                    </option>

                    <option value="ADMIN">
                        ADMIN
                    </option>

                    <option value="STORE_OWNER">
                        STORE_OWNER
                    </option>

                </select>

            </div>


            {loading ? (
                <Loading />
            ) : (

                <Table>

                    <thead>

                        <tr>

                            <SortableHeader
                                text="Name"
                                onClick={() =>
                                    changeSort(
                                        "name"
                                    )
                                }
                            />

                            <SortableHeader
                                text="Email"
                                onClick={() =>
                                    changeSort(
                                        "email"
                                    )
                                }
                            />

                            <SortableHeader
                                text="Address"
                                onClick={() =>
                                    changeSort(
                                        "address"
                                    )
                                }
                            />

                            <SortableHeader
                                text="Role"
                                onClick={() =>
                                    changeSort(
                                        "role"
                                    )
                                }
                            />

                            <th>
                                Action
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {filteredUsers.map(
                            (item) => (

                                <tr
                                    key={item.id}
                                >

                                    <td>
                                        {item.name}
                                    </td>

                                    <td>
                                        {item.email}
                                    </td>

                                    <td>
                                        {item.address}
                                    </td>

                                    <td>
                                        <RoleBadge
                                            role={
                                                item.role
                                            }
                                        />
                                    </td>

                                    <td>
                                        <button
                                            className="small-button"
                                            onClick={() =>
                                                setSelectedUser(
                                                    item
                                                )
                                            }
                                        >
                                            View
                                        </button>
                                    </td>

                                </tr>
                            )
                        )}

                    </tbody>

                </Table>
            )}


            {selectedUser && (

                <UserDetailsModal
                    user={selectedUser}
                    onClose={() =>
                        setSelectedUser(
                            null
                        )
                    }
                />

            )}

        </div>
    );
}


/* =========================================================
   ADMIN STORES
========================================================= */

function AdminStores() {

    const [stores, setStores] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [sort, setSort] =
        useState({
            field: "name",
            direction: "asc"
        });

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {
        loadStores();
    }, []);


    const loadStores = async () => {

        try {

            const data =
                await apiRequest(
                    "/api/admin/stores"
                );

            setStores(
                getResponseData(data)
            );

        } catch (error) {

            setError(
                error.message
            );

        } finally {

            setLoading(false);
        }
    };


    const filteredStores =
        useMemo(() => {

            const value =
                search
                    .toLowerCase()
                    .trim();


            return [...stores]
                .filter((store) => {

                    if (!value) {
                        return true;
                    }

                    return (
                        String(
                            store.name || ""
                        )
                            .toLowerCase()
                            .includes(value) ||

                        String(
                            store.email || ""
                        )
                            .toLowerCase()
                            .includes(value) ||

                        String(
                            store.address || ""
                        )
                            .toLowerCase()
                            .includes(value)
                    );
                })
                .sort((a, b) => {

                    if (
                        sort.field ===
                        "rating"
                    ) {

                        const first =
                            Number(
                                a.rating ??
                                a.overallRating ??
                                0
                            );

                        const second =
                            Number(
                                b.rating ??
                                b.overallRating ??
                                0
                            );

                        return sort.direction ===
                            "asc"
                            ? first - second
                            : second - first;
                    }


                    const first =
                        String(
                            a[sort.field] || ""
                        ).toLowerCase();

                    const second =
                        String(
                            b[sort.field] || ""
                        ).toLowerCase();

                    return sort.direction ===
                        "asc"
                        ? first.localeCompare(
                            second
                        )
                        : second.localeCompare(
                            first
                        );
                });

        }, [
            stores,
            search,
            sort
        ]);


    const changeSort = (field) => {

        setSort((current) => ({
            field,

            direction:
                current.field === field &&
                current.direction === "asc"
                    ? "desc"
                    : "asc"
        }));
    };


    return (
        <div>

            <PageTitle
                title="Stores"
                description="All registered stores"
            />


            {error && (
                <Alert
                    type="error"
                    message={error}
                />
            )}


            <div className="filters">

                <input
                    placeholder="Search name, email or address"
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                />

            </div>


            {loading ? (
                <Loading />
            ) : (

                <Table>

                    <thead>

                        <tr>

                            <SortableHeader
                                text="Name"
                                onClick={() =>
                                    changeSort(
                                        "name"
                                    )
                                }
                            />

                            <SortableHeader
                                text="Email"
                                onClick={() =>
                                    changeSort(
                                        "email"
                                    )
                                }
                            />

                            <SortableHeader
                                text="Address"
                                onClick={() =>
                                    changeSort(
                                        "address"
                                    )
                                }
                            />

                            <SortableHeader
                                text="Rating"
                                onClick={() =>
                                    changeSort(
                                        "rating"
                                    )
                                }
                            />

                        </tr>

                    </thead>


                    <tbody>

                        {filteredStores.map(
                            (store) => (

                                <tr
                                    key={store.id}
                                >

                                    <td>
                                        {store.name}
                                    </td>

                                    <td>
                                        {store.email}
                                    </td>

                                    <td>
                                        {store.address}
                                    </td>

                                    <td>
                                        ⭐{" "}
                                        {Number(
                                            store.rating ??
                                            store.overallRating ??
                                            0
                                        ).toFixed(2)}
                                    </td>

                                </tr>
                            )
                        )}

                    </tbody>

                </Table>

            )}

        </div>
    );
}


/* =========================================================
   ADMIN ADD USER
========================================================= */

function AdminAddUser() {

    const [form, setForm] =
        useState({
            name: "",
            email: "",
            password: "",
            address: "",
            role: "USER"
        });

    const [showPassword, setShowPassword] =
        useState(false);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    const update = (
        field,
        value
    ) => {

        setForm({
            ...form,
            [field]: value
        });
    };


    const submit = async (event) => {

        event.preventDefault();

        setError("");
        setMessage("");


        const errors = [
            validateName(form.name),
            validateEmail(form.email),
            validatePassword(
                form.password
            ),
            validateAddress(
                form.address
            )
        ].filter(Boolean);


        if (errors.length) {

            setError(
                errors[0]
            );

            return;
        }


        setLoading(true);


        try {

            await apiRequest(
                "/api/admin/users",
                {
                    method: "POST",

                    body: JSON.stringify(
                        form
                    )
                }
            );


            setMessage(
                "User created successfully."
            );


            setForm({
                name: "",
                email: "",
                password: "",
                address: "",
                role: "USER"
            });

        } catch (error) {

            setError(
                error.message
            );

        } finally {

            setLoading(false);
        }
    };


    return (
        <FormPanel
            title="Add User"
            description="Create a normal user or administrator"
        >

            <form
                onSubmit={submit}
                className="form-grid"
            >

                <Field
                    label="Name"
                    value={form.name}
                    onChange={(value) =>
                        update(
                            "name",
                            value
                        )
                    }
                    placeholder="20-60 characters"
                    required
                />


                <Field
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(value) =>
                        update(
                            "email",
                            value
                        )
                    }
                    required
                />


                <PasswordField
                    label="Password"
                    value={form.password}
                    onChange={(value) =>
                        update(
                            "password",
                            value
                        )
                    }
                    showPassword={showPassword}
                    setShowPassword={
                        setShowPassword
                    }
                    placeholder="8-16 characters"
                    required
                />


                <div>

                    <label>
                        Role
                    </label>

                    <select
                        value={form.role}
                        onChange={(e) =>
                            update(
                                "role",
                                e.target.value
                            )
                        }
                    >

                        <option value="USER">
                            Normal User
                        </option>

                        <option value="ADMIN">
                            Administrator
                        </option>

                    </select>

                </div>


                <div className="full-column">

                    <label>
                        Address
                    </label>

                    <textarea
                        value={form.address}
                        onChange={(e) =>
                            update(
                                "address",
                                e.target.value
                            )
                        }
                        maxLength={400}
                        required
                    />

                    <div className="field-hint">
                        {form.address.length}/400
                    </div>

                </div>


                {error && (
                    <div className="full-column">
                        <Alert
                            type="error"
                            message={error}
                        />
                    </div>
                )}


                {message && (
                    <div className="full-column">
                        <Alert
                            type="success"
                            message={message}
                        />
                    </div>
                )}


                <div className="full-column">

                    <button
                        className="primary"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating..."
                            : "Create User"}
                    </button>

                </div>

            </form>

        </FormPanel>
    );
}


/* =========================================================
   ADMIN ADD STORE
========================================================= */

function AdminAddStore() {

    const [form, setForm] =
        useState({
            name: "",
            email: "",
            address: "",
            owner_id: ""
        });

    const [owners, setOwners] =
        useState([]);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    useEffect(() => {
        loadOwners();
    }, []);


    const loadOwners = async () => {

        try {

            const data =
                await apiRequest(
                    "/api/admin/users"
                );

            const list =
                getResponseData(data);

            setOwners(
                list.filter(
                    (item) =>
                        item.role ===
                        "STORE_OWNER"
                )
            );

        } catch {
            // Owner selection remains optional.
        }
    };


    const update = (
        field,
        value
    ) => {

        setForm({
            ...form,
            [field]: value
        });
    };


    const submit = async (event) => {

        event.preventDefault();

        setError("");
        setMessage("");


        const nameError =
            validateName(form.name);

        const emailError =
            validateEmail(form.email);

        const addressError =
            validateAddress(
                form.address
            );


        if (
            nameError ||
            emailError ||
            addressError
        ) {

            setError(
                nameError ||
                emailError ||
                addressError
            );

            return;
        }


        setLoading(true);


        try {

            await apiRequest(
                "/api/admin/stores",
                {
                    method: "POST",

                    body: JSON.stringify({
                        name: form.name,
                        email: form.email,
                        address: form.address,
                        owner_id:
                            form.owner_id
                                ? Number(
                                    form.owner_id
                                )
                                : null
                    })
                }
            );


            setMessage(
                "Store created successfully."
            );


            setForm({
                name: "",
                email: "",
                address: "",
                owner_id: ""
            });

        } catch (error) {

            setError(
                error.message
            );

        } finally {

            setLoading(false);
        }
    };


    return (
        <FormPanel
            title="Add Store"
            description="Register a new store"
        >

            <form
                onSubmit={submit}
                className="form-grid"
            >

                <Field
                    label="Store Name"
                    value={form.name}
                    onChange={(value) =>
                        update(
                            "name",
                            value
                        )
                    }
                    placeholder="20-60 characters"
                    required
                />


                <Field
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(value) =>
                        update(
                            "email",
                            value
                        )
                    }
                    required
                />


                <div>

                    <label>
                        Store Owner
                    </label>

                    <select
                        value={form.owner_id}
                        onChange={(e) =>
                            update(
                                "owner_id",
                                e.target.value
                            )
                        }
                    >

                        <option value="">
                            Select owner
                        </option>

                        {owners.map(
                            (owner) => (

                                <option
                                    key={owner.id}
                                    value={owner.id}
                                >
                                    {owner.name}
                                </option>

                            )
                        )}

                    </select>

                </div>


                <div className="full-column">

                    <label>
                        Address
                    </label>

                    <textarea
                        value={form.address}
                        onChange={(e) =>
                            update(
                                "address",
                                e.target.value
                            )
                        }
                        maxLength={400}
                        required
                    />

                    <div className="field-hint">
                        {form.address.length}/400
                    </div>

                </div>


                {error && (
                    <div className="full-column">
                        <Alert
                            type="error"
                            message={error}
                        />
                    </div>
                )}


                {message && (
                    <div className="full-column">
                        <Alert
                            type="success"
                            message={message}
                        />
                    </div>
                )}


                <div className="full-column">

                    <button
                        className="primary"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating..."
                            : "Create Store"}
                    </button>

                </div>

            </form>

        </FormPanel>
    );
}


/* =========================================================
   NORMAL USER
========================================================= */

function UserDashboard({
    user,
    onLogout
}) {

    const [stores, setStores] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [sort, setSort] =
        useState({
            field: "name",
            direction: "asc"
        });

    const [ratingStore, setRatingStore] =
        useState(null);

    const [rating, setRating] =
        useState(5);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [loading, setLoading] =
        useState(true);


    const loadStores = async () => {

        try {

            setLoading(true);

            const data =
                await apiRequest(
                    "/api/user/stores"
                );

            setStores(
                getResponseData(data)
            );

        } catch (error) {

            setError(
                error.message
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {
        loadStores();
    }, []);


    const filteredStores =
        useMemo(() => {

            const value =
                search
                    .toLowerCase()
                    .trim();


            return [...stores]
                .filter((store) => {

                    if (!value) {
                        return true;
                    }

                    return (
                        String(
                            store.name || ""
                        )
                            .toLowerCase()
                            .includes(value) ||

                        String(
                            store.address || ""
                        )
                            .toLowerCase()
                            .includes(value)
                    );
                })
                .sort((a, b) => {

                    if (
                        sort.field ===
                        "rating"
                    ) {

                        const first =
                            Number(
                                a.overallRating ||
                                0
                            );

                        const second =
                            Number(
                                b.overallRating ||
                                0
                            );

                        return sort.direction ===
                            "asc"
                            ? first - second
                            : second - first;
                    }


                    const first =
                        String(
                            a.name || ""
                        ).toLowerCase();

                    const second =
                        String(
                            b.name || ""
                        ).toLowerCase();

                    return sort.direction ===
                        "asc"
                        ? first.localeCompare(
                            second
                        )
                        : second.localeCompare(
                            first
                        );
                });

        }, [
            stores,
            search,
            sort
        ]);


    const changeSort = (field) => {

        setSort((current) => ({
            field,

            direction:
                current.field === field &&
                current.direction === "asc"
                    ? "desc"
                    : "asc"
        }));
    };


    const saveRating = async () => {

        if (!ratingStore) {
            return;
        }


        try {

            setError("");
            setMessage("");


            const existing =
                ratingStore.userRating !==
                    null &&
                ratingStore.userRating !==
                    undefined;


            const response =
                await apiRequest(
                    `/api/user/stores/${ratingStore.id}/rating`,
                    {
                        method:
                            existing
                                ? "PUT"
                                : "POST",

                        body: JSON.stringify({
                            rating:
                                Number(
                                    rating
                                )
                        })
                    }
                );


            setMessage(
                response.message ||
                "Rating saved successfully."
            );

            setRatingStore(null);

            await loadStores();

        } catch (error) {

            setError(
                error.message
            );
        }
    };


    return (
        <DashboardLayout
            title="Store Rating"
            user={user}
            onLogout={onLogout}
            tabs={[
                ["stores", "Stores"]
            ]}
            activeTab="stores"
            setActiveTab={() => {}}
        >

            <PageTitle
                title="Registered Stores"
                description="Search stores and submit your rating"
            />


            {error && (
                <Alert
                    type="error"
                    message={error}
                />
            )}


            {message && (
                <Alert
                    type="success"
                    message={message}
                />
            )}


            <div className="filters">

                <input
                    placeholder="Search by store name or address"
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                />

                <button
                    className="secondary"
                    onClick={() =>
                        changeSort("name")
                    }
                >
                    Name ↑↓
                </button>

                <button
                    className="secondary"
                    onClick={() =>
                        changeSort("rating")
                    }
                >
                    Rating ↑↓
                </button>

            </div>


            {loading ? (
                <Loading />
            ) : (

                <Table>

                    <thead>

                        <tr>

                            <th>
                                Store Name
                            </th>

                            <th>
                                Address
                            </th>

                            <th>
                                Overall Rating
                            </th>

                            <th>
                                Your Rating
                            </th>

                            <th>
                                Action
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {filteredStores.map(
                            (store) => (

                                <tr
                                    key={store.id}
                                >

                                    <td>
                                        {store.name}
                                    </td>

                                    <td>
                                        {store.address}
                                    </td>

                                    <td>
                                        ⭐{" "}
                                        {Number(
                                            store.overallRating ||
                                            0
                                        ).toFixed(2)}
                                    </td>

                                    <td>
                                        {store.userRating ??
                                            "Not rated"}
                                    </td>

                                    <td>

                                        <button
                                            className="small-button"
                                            onClick={() => {

                                                setRatingStore(
                                                    store
                                                );

                                                setRating(
                                                    store.userRating ||
                                                    5
                                                );

                                            }}
                                        >

                                            {store.userRating
                                                ? "Modify"
                                                : "Rate"}

                                        </button>

                                    </td>

                                </tr>

                            )
                        )}

                    </tbody>

                </Table>

            )}


            <PasswordPanel />


            {ratingStore && (

                <RatingModal
                    store={ratingStore}
                    rating={rating}
                    setRating={setRating}
                    onSave={saveRating}
                    onClose={() =>
                        setRatingStore(
                            null
                        )
                    }
                />

            )}

        </DashboardLayout>
    );


    function PasswordPanel() {

        return (
            <div className="panel password-panel">

                <h3>
                    Update Password
                </h3>

                <PasswordForm />

            </div>
        );
    }


    function PasswordForm() {

        const [currentPassword, setCurrentPassword] =
            useState("");

        const [newPassword, setNewPassword] =
            useState("");

        const [showCurrent, setShowCurrent] =
            useState(false);

        const [showNew, setShowNew] =
            useState(false);

        const [passwordMessage, setPasswordMessage] =
            useState("");

        const [passwordError, setPasswordError] =
            useState("");


        const submitPassword =
            async (event) => {

                event.preventDefault();

                setPasswordError("");
                setPasswordMessage("");


                const validation =
                    validatePassword(
                        newPassword
                    );

                if (validation) {

                    setPasswordError(
                        validation
                    );

                    return;
                }


                try {

                    const response =
                        await apiRequest(
                            "/api/user/password",
                            {
                                method: "PUT",

                                body:
                                    JSON.stringify({
                                        currentPassword,
                                        newPassword
                                    })
                            }
                        );


                    setPasswordMessage(
                        response.message ||
                        "Password updated successfully."
                    );

                    setCurrentPassword("");
                    setNewPassword("");

                } catch (error) {

                    setPasswordError(
                        error.message
                    );
                }
            };


        return (
            <form
                className="password-form"
                onSubmit={submitPassword}
            >

                <PasswordField
                    label="Current Password"
                    value={currentPassword}
                    onChange={
                        setCurrentPassword
                    }
                    showPassword={showCurrent}
                    setShowPassword={
                        setShowCurrent
                    }
                    required
                />

                <PasswordField
                    label="New Password"
                    value={newPassword}
                    onChange={
                        setNewPassword
                    }
                    showPassword={showNew}
                    setShowPassword={
                        setShowNew
                    }
                    required
                />


                {passwordError && (
                    <Alert
                        type="error"
                        message={
                            passwordError
                        }
                    />
                )}


                {passwordMessage && (
                    <Alert
                        type="success"
                        message={
                            passwordMessage
                        }
                    />
                )}


                <button className="primary">
                    Update Password
                </button>

            </form>
        );
    }
}


/* =========================================================
   STORE OWNER
========================================================= */

function StoreOwnerDashboard({
    user,
    onLogout
}) {

    const [dashboard, setDashboard] =
        useState(null);

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(true);


    useEffect(() => {
        loadDashboard();
    }, []);


    const loadDashboard = async () => {

        try {

            const data =
                await apiRequest(
                    "/api/store-owner/dashboard"
                );

            setDashboard(
                data.data ||
                data
            );

        } catch (error) {

            setError(
                error.message
            );

        } finally {

            setLoading(false);
        }
    };


    return (
        <DashboardLayout
            title="Store Owner"
            user={user}
            onLogout={onLogout}
            tabs={[
                ["dashboard", "Dashboard"]
            ]}
            activeTab="dashboard"
            setActiveTab={() => {}}
        >

            <PageTitle
                title="Store Dashboard"
                description="Monitor customer ratings"
            />


            {error && (
                <Alert
                    type="error"
                    message={error}
                />
            )}


            {loading ? (
                <Loading />
            ) : dashboard ? (

                <>

                    <div className="stats-grid">

                        <StatCard
                            title="Average Rating"
                            value={
                                `⭐ ${
                                    dashboard.averageRating ??
                                    0
                                }`
                            }
                        />

                        <StatCard
                            title="Total Ratings"
                            value={
                                dashboard.totalRatings ??
                                dashboard.ratings?.length ??
                                0
                            }
                        />

                    </div>


                    <div className="panel">

                        <h3>
                            Store Information
                        </h3>

                        <div className="info-grid">

                            <Info
                                label="Name"
                                value={
                                    dashboard.store?.name
                                }
                            />

                            <Info
                                label="Email"
                                value={
                                    dashboard.store?.email
                                }
                            />

                            <Info
                                label="Address"
                                value={
                                    dashboard.store?.address
                                }
                            />

                        </div>

                    </div>


                    <div className="panel">

                        <h3>
                            Customers Who Rated Your Store
                        </h3>


                        <Table>

                            <thead>

                                <tr>

                                    <th>
                                        Name
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Rating
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {(
                                    dashboard.ratings ||
                                    []
                                ).map(
                                    (rating) => (

                                        <tr
                                            key={
                                                rating.id
                                            }
                                        >

                                            <td>
                                                {
                                                    rating.userName
                                                }
                                            </td>

                                            <td>
                                                {
                                                    rating.userEmail
                                                }
                                            </td>

                                            <td>
                                                ⭐{" "}
                                                {
                                                    rating.rating
                                                }
                                            </td>

                                            <td>
                                                {
                                                    rating.created_at
                                                        ? new Date(
                                                            rating.created_at
                                                        ).toLocaleDateString()
                                                        : "-"
                                                }
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </Table>

                    </div>


                    <OwnerPassword />

                </>

            ) : null}

        </DashboardLayout>
    );


    function OwnerPassword() {

        const [currentPassword, setCurrentPassword] =
            useState("");

        const [newPassword, setNewPassword] =
            useState("");

        const [showCurrent, setShowCurrent] =
            useState(false);

        const [showNew, setShowNew] =
            useState(false);

        const [message, setMessage] =
            useState("");

        const [passwordError, setPasswordError] =
            useState("");


        const submit = async (event) => {

            event.preventDefault();

            setMessage("");
            setPasswordError("");


            const validation =
                validatePassword(
                    newPassword
                );

            if (validation) {

                setPasswordError(
                    validation
                );

                return;
            }


            try {

                const response =
                    await apiRequest(
                        "/api/user/password",
                        {
                            method: "PUT",

                            body:
                                JSON.stringify({
                                    currentPassword,
                                    newPassword
                                })
                        }
                    );


                setMessage(
                    response.message ||
                    "Password updated successfully."
                );

                setCurrentPassword("");
                setNewPassword("");

            } catch (error) {

                setPasswordError(
                    error.message
                );
            }
        };


        return (
            <div className="panel">

                <h3>
                    Update Password
                </h3>

                <form
                    className="password-form"
                    onSubmit={submit}
                >

                    <PasswordField
                        label="Current Password"
                        value={currentPassword}
                        onChange={
                            setCurrentPassword
                        }
                        showPassword={
                            showCurrent
                        }
                        setShowPassword={
                            setShowCurrent
                        }
                        required
                    />

                    <PasswordField
                        label="New Password"
                        value={newPassword}
                        onChange={
                            setNewPassword
                        }
                        showPassword={
                            showNew
                        }
                        setShowPassword={
                            setShowNew
                        }
                        required
                    />


                    {passwordError && (
                        <Alert
                            type="error"
                            message={
                                passwordError
                            }
                        />
                    )}


                    {message && (
                        <Alert
                            type="success"
                            message={
                                message
                            }
                        />
                    )}


                    <button className="primary">
                        Update Password
                    </button>

                </form>

            </div>
        );
    }
}


/* =========================================================
   SHARED COMPONENTS
========================================================= */

function DashboardLayout({
    title,
    user,
    onLogout,
    tabs,
    activeTab,
    setActiveTab,
    children
}) {

    return (
        <div className="dashboard">

            <aside className="sidebar">

                <div className="sidebar-brand">

                    <div className="brand-mark">
                        SR
                    </div>

                    <div>
                        <strong>
                            Store Rating
                        </strong>

                        <small>
                            Roxiler
                        </small>
                    </div>

                </div>


                <nav>

                    {tabs.map(
                        ([key, label]) => (

                            <button
                                key={key}
                                className={
                                    activeTab === key
                                        ? "nav-item active"
                                        : "nav-item"
                                }
                                onClick={() =>
                                    setActiveTab(
                                        key
                                    )
                                }
                            >
                                {label}
                            </button>

                        )
                    )}

                </nav>


                <div className="sidebar-bottom">

                    <div className="user-mini">

                        <strong>
                            {user.name}
                        </strong>

                        <span>
                            {user.role}
                        </span>

                    </div>


                    <button
                        className="logout-button"
                        onClick={onLogout}
                    >
                        Logout
                    </button>

                </div>

            </aside>


            <main className="main-content">

                {children}

            </main>

        </div>
    );
}


function PageTitle({
    title,
    description
}) {

    return (
        <div className="page-title">

            <h2>
                {title}
            </h2>

            <p>
                {description}
            </p>

        </div>
    );
}


function StatCard({
    title,
    value
}) {

    return (
        <div className="stat-card">

            <span>
                {title}
            </span>

            <strong>
                {value}
            </strong>

        </div>
    );
}


/* =========================================================
   NORMAL INPUT
========================================================= */

function Field({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    required
}) {

    return (
        <div>

            <label>
                {label}
            </label>

            <input
                type={type}
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value
                    )
                }
                placeholder={placeholder}
                required={required}
            />

        </div>
    );
}


/* =========================================================
   PASSWORD INPUT WITH SHOW/HIDE
========================================================= */

function PasswordField({
    label,
    value,
    onChange,
    showPassword,
    setShowPassword,
    placeholder,
    required
}) {

    return (
        <div>

            <label>
                {label}
            </label>

            <div className="password-input-wrapper">

                <input
                    type={
                        showPassword
                            ? "text"
                            : "password"
                    }
                    value={value}
                    onChange={(event) =>
                        onChange(
                            event.target.value
                        )
                    }
                    placeholder={placeholder}
                    required={required}
                />

                <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                        setShowPassword(
                            !showPassword
                        )
                    }
                    aria-label={
                        showPassword
                            ? "Hide password"
                            : "Show password"
                    }
                >
                    {showPassword
                        ? "Hide"
                        : "Show"}
                </button>

            </div>

        </div>
    );
}


function Alert({
    type,
    message
}) {

    return (
        <div
            className={
                type === "error"
                    ? "alert error"
                    : "alert success"
            }
        >
            {message}
        </div>
    );
}


function Loading() {

    return (
        <div className="loading">
            Loading...
        </div>
    );
}


function Table({
    children
}) {

    return (
        <div className="table-container">

            <table>
                {children}
            </table>

        </div>
    );
}


function SortableHeader({
    text,
    onClick
}) {

    return (
        <th>

            <button
                className="sort-button"
                onClick={onClick}
            >
                {text} ↑↓
            </button>

        </th>
    );
}


function RoleBadge({
    role
}) {

    return (
        <span className="role-badge">
            {role}
        </span>
    );
}


function Info({
    label,
    value
}) {

    return (
        <div className="info-item">

            <span>
                {label}
            </span>

            <strong>
                {value || "-"}
            </strong>

        </div>
    );
}


function FormPanel({
    title,
    description,
    children
}) {

    return (
        <div>

            <PageTitle
                title={title}
                description={description}
            />

            <div className="panel">
                {children}
            </div>

        </div>
    );
}


function RatingModal({
    store,
    rating,
    setRating,
    onSave,
    onClose
}) {

    return (
        <div className="modal-overlay">

            <div className="modal">

                <div className="modal-header">

                    <div>

                        <h3>
                            {store.userRating
                                ? "Modify Rating"
                                : "Rate Store"}
                        </h3>

                        <p>
                            {store.name}
                        </p>

                    </div>

                    <button
                        className="close-button"
                        onClick={onClose}
                    >
                        ×
                    </button>

                </div>


                <label>
                    Your Rating
                </label>

                <select
                    value={rating}
                    onChange={(event) =>
                        setRating(
                            event.target.value
                        )
                    }
                >

                    <option value="1">
                        1 - Poor
                    </option>

                    <option value="2">
                        2 - Fair
                    </option>

                    <option value="3">
                        3 - Good
                    </option>

                    <option value="4">
                        4 - Very Good
                    </option>

                    <option value="5">
                        5 - Excellent
                    </option>

                </select>


                <div className="modal-actions">

                    <button
                        className="secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        className="primary"
                        onClick={onSave}
                    >
                        Save Rating
                    </button>

                </div>

            </div>

        </div>
    );
}


function UserDetailsModal({
    user,
    onClose
}) {

    return (
        <div className="modal-overlay">

            <div className="modal">

                <div className="modal-header">

                    <h3>
                        User Details
                    </h3>

                    <button
                        className="close-button"
                        onClick={onClose}
                    >
                        ×
                    </button>

                </div>


                <Info
                    label="Name"
                    value={user.name}
                />

                <Info
                    label="Email"
                    value={user.email}
                />

                <Info
                    label="Address"
                    value={user.address}
                />

                <Info
                    label="Role"
                    value={user.role}
                />


                {user.role ===
                    "STORE_OWNER" && (

                    <Info
                        label="Rating"
                        value={
                            user.rating ??
                            user.averageRating ??
                            0
                        }
                    />

                )}

            </div>

        </div>
    );
}


export default App;