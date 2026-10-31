import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    Armchair,
    ArrowLeft,
    ArrowRight,
    Check,
    ChevronDown,
    FileText,
    Mail,
    MapPin,
    MessageCircle,
    Video,
} from "lucide-react";
import Navbar from "../components/navbar";
import heroImg from "../assets/images/consultimg.jpg";
import { useAuth } from "../context/authContext";

const API_URL = import.meta.env.VITE_API_URL;

const modes = [
    { value: "video", label: "Video call", icon: Video },
    { value: "in-store", label: "In-store", icon: MapPin },
    { value: "undecided", label: "Not sure yet", icon: MessageCircle },
];

const spaces = ["Living room", "Bedroom", "Dining room", "Home office", "Other"];

const budgets = [
    "Not sure yet",
    "Under Rs. 100,000",
    "Rs. 100,000 to 250,000",
    "Rs. 250,000 to 500,000",
    "Over Rs. 500,000",
];

const times = ["Any time", "Morning", "Afternoon", "Evening"];

const howItWorks = [
    {
        icon: FileText,
        title: "Tell us about your space",
        text: "Share your room, your style and what matters to you in a short brief.",
    },
    {
        icon: Mail,
        title: "We get in touch",
        text: "We review your brief and email you to confirm a time that suits you.",
    },
    {
        icon: Armchair,
        title: "Plan your room together",
        text: "Explore furniture, proportions and natural finishes, then leave with a clear plan.",
    },
];

const stepsMeta = [
    {
        label: "About you",
        title: "How can we reach you?",
        text: "Choose how you’d like to connect, then tell us who you are.",
        fields: ["name", "email", "phone"],
    },
    {
        label: "Your space",
        title: "Tell us about your space",
        text: "A few details help us prepare. Share what you can.",
        fields: ["message"],
    },
    {
        label: "Timing",
        title: "When suits you?",
        text: "Both are optional. Then check your details and send.",
        fields: ["date"],
    },
];

const LAST = stepsMeta.length - 1;

const fieldStep = { name: 0, email: 0, phone: 0, message: 1, date: 2 };

const base =
    "w-full rounded-2xl border border-accent/70 bg-background px-4 text-base outline-none transition placeholder:text-secondary/40 focus:border-primary focus:ring-4 focus:ring-primary/15 aria-[invalid=true]:border-[#9B2C1F]";
const inputClass = `${base} h-11`;
const textareaClass = `${base} min-h-40 resize-y py-3 leading-6`;

function formatPreferred(date, time) {
    const hasTime = time && time !== "Any time";

    if (!date) return hasTime ? time : "No preference";

    const label = new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return hasTime ? `${label}, ${time.toLowerCase()}` : label;
}

function Field({ id, label, optional, hint, error, className = "", children }) {
    return (
        <div className={className}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <label htmlFor={id} className="text-sm font-medium">
                    {label}
                    {optional && (
                        <span className="ml-1.5 font-normal text-secondary/60">
                            (optional)
                        </span>
                    )}
                </label>
                {hint && <span className="text-xs text-secondary/60">{hint}</span>}
            </div>

            {children}

            {error && (
                <p id={`${id}-error`} className="mt-1.5 text-sm text-[#9B2C1F]">
                    {error}
                </p>
            )}
        </div>
    );
}

function SelectBox({ id, value, onChange, options }) {
    return (
        <div className="relative">
            <select
                id={id}
                value={value}
                onChange={onChange}
                className={`${inputClass} appearance-none pr-11`}
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
            <ChevronDown
                size={18}
                aria-hidden="true"
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-secondary/60"
            />
        </div>
    );
}

export default function ConsultationPage() {
    const { user, token } = useAuth();

    const headingRef = useRef(null);
    const successRef = useRef(null);
    const previousStep = useRef(0);

    const [ready, setReady] = useState(false);
    const [step, setStep] = useState(0);
    const [attempted, setAttempted] = useState([false, false, false]);
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [sent, setSent] = useState(null);

    const [values, setValues] = useState(() => ({
        mode: "video",
        name: [user?.firstName, user?.lastName]
            .filter((part) => part && part !== "-")
            .join(" "),
        email: user?.email ?? "",
        phone: user?.contactNumber ?? "",
        space: spaces[0],
        budget: budgets[0],
        date: "",
        time: times[0],
        message: "",
    }));

    useEffect(() => {
        const id = requestAnimationFrame(() => setReady(true));

        return () => cancelAnimationFrame(id);
    }, []);

    // Focus the heading when the step changes
    useEffect(() => {
        if (previousStep.current !== step) {
            previousStep.current = step;
            headingRef.current?.focus();
        }
    }, [step]);

    useEffect(() => {
        if (sent) successRef.current?.focus();
    }, [sent]);

    const set = (key) => (event) => {
        setValues((previous) => ({ ...previous, [key]: event.target.value }));
    };

    // Today's date in the visitor's own time zone
    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);

    const errors = {};

    if (!values.name.trim()) {
        errors.name = "Enter your name.";
    }

    if (!/^\S+@\S+\.\S+$/.test(values.email)) {
        errors.email = "Enter a valid email address.";
    }

    if (values.phone && !/^[0-9+\s()-]{7,20}$/.test(values.phone)) {
        errors.phone = "Enter a valid phone number.";
    }

    if (values.message.trim().length < 10) {
        errors.message = "Tell us a little about your space (at least 10 characters).";
    }

    if (values.date && values.date < today) {
        errors.date = "Choose a date from today onwards.";
    }

    const showError = (key) => (attempted[fieldStep[key]] ? errors[key] : undefined);

    const stepHasErrors = (index) =>
        stepsMeta[index].fields.some((field) => errors[field]);

    const markAttempted = (index) =>
        setAttempted((previous) =>
            previous.map((value, i) => (i === index ? true : value))
        );

    const goNext = () => {
        markAttempted(step);
        if (!stepHasErrors(step)) setStep((current) => current + 1);
    };

    const goBack = () => setStep((current) => Math.max(current - 1, 0));

    const handleSubmit = async (event) => {
        event.preventDefault();
        setServerError("");

        if (step < LAST) {
            goNext();
            return;
        }

        setAttempted([true, true, true]);

        const firstWithErrors = stepsMeta.findIndex((_, i) => stepHasErrors(i));
        if (firstWithErrors !== -1) {
            setStep(firstWithErrors);
            return;
        }

        try {
            setLoading(true);

            const res = await fetch(`${API_URL}/consultations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    mode: values.mode,
                    name: values.name.trim(),
                    email: values.email.trim(),
                    phone: values.phone.trim(),
                    space: values.space,
                    budget: values.budget,
                    preferredDate: values.date || null,
                    preferredTime: values.time,
                    message: values.message.trim(),
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setServerError(
                    data.message || "We couldn't send your request. Please try again."
                );
                return;
            }

            setSent({ name: values.name.trim(), email: values.email.trim() });
        } catch {
            setServerError("Cannot reach the server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const startAgain = () => {
        setSent(null);
        setStep(0);
        setAttempted([false, false, false]);
        setValues((previous) => ({ ...previous, message: "", date: "" }));
    };

    const current = stepsMeta[step];
    const modeLabel = modes.find((mode) => mode.value === values.mode)?.label;

    const summary = [
        ["Connect via", modeLabel],
        ["Name", values.name.trim()],
        ["Email", values.email.trim()],
        ...(values.phone.trim() ? [["Phone", values.phone.trim()]] : []),
        ["Space", values.space],
        ["Budget", values.budget],
        ["Preferred time", formatPreferred(values.date, values.time)],
        ["Your message", values.message.trim()],
    ];

    return (
        <main className="min-h-screen bg-background bg-[repeating-linear-gradient(100deg,transparent_0_14px,rgba(113,62,38,0.045)_14px_15px)]">
            <div className="pointer-events-none sticky top-0 z-50 px-4 pt-4 sm:px-8 sm:pt-6">
                <div className="pointer-events-auto">
                    <Navbar />
                </div>
            </div>

            {/* 1. Hero */}
            <section className="px-4 pt-6 sm:px-8">
                <div className="relative mx-auto max-w-[1680px] overflow-hidden rounded-32px bg-secondary shadow-[0_30px_80px_rgba(113,62,38,0.25)] sm:rounded-[44px]">
                    <img
                        src={heroImg}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-secondary/80 lg:bg-transparent lg:bg-[linear-gradient(90deg,rgba(40,21,14,0.94)_0%,rgba(40,21,14,0.8)_42%,rgba(40,21,14,0.25)_100%)]" />

                    <div
                        className={`relative flex min-h-520px items-center px-6 py-16 transition duration-700 ease-out motion-reduce:transition-none sm:min-h-600px sm:px-12 lg:px-16 ${ready ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                            }`}
                    >
                        <div className="max-w-2xl text-background">
                            <p className="flex items-center gap-4 text-sm font-medium uppercase tracking-[0.25em]">
                                <span aria-hidden="true" className="h-px w-10 bg-highlight" />
                                The Furniva design studio
                            </p>

                            <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                                Thoughtful design,{" "}
                                <em className="text-highlight">made around you.</em>
                            </h1>

                            <p className="mt-6 max-w-xl text-lg leading-8 text-background/85 sm:text-xl sm:leading-9">
                                Your space. Your story. A little guidance to bring it all
                                together.
                            </p>

                            <a
                                href="#consultation-form"
                                className="group mt-10 inline-flex items-center gap-3 rounded-full bg-background px-8 py-4 text-lg font-medium text-primary transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-background"
                            >
                                Plan my space
                                <ArrowRight
                                    size={20}
                                    aria-hidden="true"
                                    className="transition motion-safe:group-hover:translate-x-1"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. How it works */}
            <section
                aria-labelledby="how-heading"
                className="mt-20 border-y border-accent/40 bg-accent/15 px-4 py-14 sm:mt-24 sm:px-8 sm:py-20"
            >
                <div className="mx-auto max-w-6xl">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
                            How it works
                        </p>
                        <h2
                            id="how-heading"
                            className="mt-4 font-display text-4xl leading-tight tracking-tight sm:text-5xl"
                        >
                            A thoughtful beginning
                        </h2>
                        <p className="mt-4 text-lg leading-8 text-secondary/70">
                            From your first idea to a clear plan for your room, in three
                            simple steps.
                        </p>
                    </div>

                    <ol className="mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
                        {howItWorks.map(({ icon: Icon, title, text }, index) => (
                            <li
                                key={title}
                                className="rounded-[28px] border border-accent/50 bg-[#FDF8F1] p-8 shadow-[0_10px_30px_rgba(113,62,38,0.07)]"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent/50 text-primary">
                                        <Icon size={24} aria-hidden="true" />
                                    </span>
                                    <span
                                        aria-hidden="true"
                                        className="font-display text-4xl text-accent"
                                    >
                                        0{index + 1}
                                    </span>
                                </div>
                                <h3 className="mt-6 font-display text-2xl">{title}</h3>
                                <p className="mt-2 leading-7 text-secondary/70">{text}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* 3. Form */}
            <section
                id="consultation-form"
                aria-labelledby="brief-heading"
                className="scroll-mt-24 px-4 py-14 sm:px-8 sm:py-20"
            >
                <div className="mx-auto max-w-3xl">
                    <div className="text-center">
                        <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
                            Your brief
                        </p>
                        <h2
                            id="brief-heading"
                            className="mt-4 font-display text-4xl leading-tight tracking-tight sm:text-5xl"
                        >
                            Let’s start with your space.
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-secondary/70">
                            Three short steps. Share what you can, and skip what you can’t.
                        </p>
                    </div>

                    <div className="mt-12 rounded-[28px] border border-accent/50 bg-[#FDF8F1] p-6 shadow-[0_20px_60px_rgba(113,62,38,0.12)] sm:p-10">
                        {sent ? (
                            <div role="status" className="py-8 text-center">
                                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#1F5C36] text-white">
                                    <Check size={30} aria-hidden="true" />
                                </span>

                                <h3
                                    ref={successRef}
                                    tabIndex={-1}
                                    className="mt-6 font-display text-3xl outline-none sm:text-4xl"
                                >
                                    Request received
                                </h3>

                                <p className="mx-auto mt-3 max-w-md leading-7 text-secondary/75">
                                    Thank you, {sent.name.split(" ")[0]}. We’ll review your brief
                                    and email you at{" "}
                                    <strong className="font-medium text-secondary">
                                        {sent.email}
                                    </strong>{" "}
                                    to confirm a time.
                                </p>

                                <div className="mt-8 flex flex-wrap justify-center gap-3">
                                    <Link
                                        to="/shop"
                                        className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-base font-medium text-background transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                                    >
                                        Browse the shop
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={startAgain}
                                        className="inline-flex h-11 items-center rounded-full border border-accent px-6 text-base font-medium text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                                    >
                                        Send another request
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Progress */}
                                <ol aria-label="Progress" className="flex items-center">
                                    {stepsMeta.map((item, index) => (
                                        <li
                                            key={item.label}
                                            aria-current={index === step ? "step" : undefined}
                                            className={`flex items-center ${index < LAST ? "flex-1" : ""
                                                }`}
                                        >
                                            <span
                                                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-medium transition ${index < step
                                                    ? "bg-primary text-background"
                                                    : index === step
                                                        ? "bg-primary text-background ring-4 ring-primary/20"
                                                        : "border border-accent bg-background text-secondary/60"
                                                    }`}
                                            >
                                                {index < step ? (
                                                    <Check size={16} aria-hidden="true" />
                                                ) : (
                                                    index + 1
                                                )}
                                            </span>

                                            <span
                                                className={`ml-3 hidden whitespace-nowrap text-sm sm:inline ${index === step
                                                    ? "font-medium text-primary"
                                                    : "text-secondary/60"
                                                    }`}
                                            >
                                                {item.label}
                                            </span>

                                            {index < LAST && (
                                                <span
                                                    aria-hidden="true"
                                                    className={`mx-3 h-px flex-1 sm:mx-4 ${index < step ? "bg-primary" : "bg-accent"
                                                        }`}
                                                />
                                            )}
                                        </li>
                                    ))}
                                </ol>

                                <p className="mt-3 text-sm text-secondary/60 sm:hidden">
                                    Step {step + 1} of {stepsMeta.length}: {current.label}
                                </p>

                                <div className="mt-8">
                                    <h3
                                        ref={headingRef}
                                        tabIndex={-1}
                                        className="font-display text-2xl outline-none sm:text-3xl"
                                    >
                                        {current.title}
                                    </h3>
                                    <p className="mt-1.5 text-secondary/70">{current.text}</p>
                                </div>

                                <form onSubmit={handleSubmit} noValidate className="mt-7">
                                    {/* Step 1: About you */}
                                    {step === 0 && (
                                        <div className="space-y-6">
                                            <fieldset>
                                                <legend className="sr-only">
                                                    How would you like to connect?
                                                </legend>

                                                <div className="grid gap-3 sm:grid-cols-3">
                                                    {modes.map(({ value, label, icon: Icon }) => (
                                                        <label
                                                            key={value}
                                                            className="relative block cursor-pointer"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="mode"
                                                                value={value}
                                                                checked={values.mode === value}
                                                                onChange={set("mode")}
                                                                className="peer sr-only"
                                                            />
                                                            <span
                                                                aria-hidden="true"
                                                                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-secondary/40 bg-background transition peer-checked:border-primary peer-checked:bg-primary peer-checked:shadow-[inset_0_0_0_3px_#FDF8F1]"
                                                            />
                                                            <span className="flex h-14 items-center gap-3 rounded-2xl border border-accent/70 bg-background pl-11 pr-4 text-[15px] transition hover:border-primary/60 peer-checked:border-primary peer-checked:bg-accent/30 peer-checked:font-medium peer-checked:text-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
                                                                <Icon
                                                                    size={18}
                                                                    aria-hidden="true"
                                                                    className="text-primary"
                                                                />
                                                                {label}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </fieldset>

                                            <Field id="name" label="Your name" error={showError("name")}>
                                                <input
                                                    id="name"
                                                    value={values.name}
                                                    onChange={set("name")}
                                                    placeholder="Full name"
                                                    autoComplete="name"
                                                    aria-invalid={!!showError("name")}
                                                    aria-describedby={
                                                        showError("name") ? "name-error" : undefined
                                                    }
                                                    className={inputClass}
                                                />
                                            </Field>

                                            <div className="grid gap-5 sm:grid-cols-2">
                                                <Field
                                                    id="email"
                                                    label="Email address"
                                                    error={showError("email")}
                                                >
                                                    <input
                                                        id="email"
                                                        type="email"
                                                        value={values.email}
                                                        onChange={set("email")}
                                                        placeholder="you@example.com"
                                                        autoComplete="email"
                                                        aria-invalid={!!showError("email")}
                                                        aria-describedby={
                                                            showError("email") ? "email-error" : undefined
                                                        }
                                                        className={inputClass}
                                                    />
                                                </Field>

                                                <Field
                                                    id="phone"
                                                    label="Phone number"
                                                    optional
                                                    error={showError("phone")}
                                                >
                                                    <input
                                                        id="phone"
                                                        type="tel"
                                                        value={values.phone}
                                                        onChange={set("phone")}
                                                        placeholder="077 123 4567"
                                                        autoComplete="tel"
                                                        aria-invalid={!!showError("phone")}
                                                        aria-describedby={
                                                            showError("phone") ? "phone-error" : undefined
                                                        }
                                                        className={inputClass}
                                                    />
                                                </Field>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2: Your space */}
                                    {step === 1 && (
                                        <div className="space-y-6">
                                            <div className="grid gap-5 sm:grid-cols-2">
                                                <Field id="space" label="Which space are you thinking about?">
                                                    <SelectBox
                                                        id="space"
                                                        value={values.space}
                                                        onChange={set("space")}
                                                        options={spaces}
                                                    />
                                                </Field>

                                                <Field id="budget" label="Budget" optional>
                                                    <SelectBox
                                                        id="budget"
                                                        value={values.budget}
                                                        onChange={set("budget")}
                                                        options={budgets}
                                                    />
                                                </Field>
                                            </div>

                                            <Field
                                                id="message"
                                                label="Tell us about your space"
                                                hint={`${values.message.length}/1000`}
                                                error={showError("message")}
                                            >
                                                <textarea
                                                    id="message"
                                                    value={values.message}
                                                    onChange={set("message")}
                                                    maxLength={1000}
                                                    placeholder="Your ideas, favourite styles, room dimensions, or a piece you have your eye on..."
                                                    aria-invalid={!!showError("message")}
                                                    aria-describedby={
                                                        showError("message") ? "message-error" : undefined
                                                    }
                                                    className={textareaClass}
                                                />
                                                <p className="mt-2 text-sm text-secondary/60">
                                                    Helpful to include: the room size, styles you like and
                                                    any pieces you have in mind.
                                                </p>
                                            </Field>
                                        </div>
                                    )}

                                    {/* Step 3: Timing and review */}
                                    {step === 2 && (
                                        <div className="space-y-8">
                                            <div className="grid gap-5 sm:grid-cols-2">
                                                <Field
                                                    id="date"
                                                    label="Preferred date"
                                                    optional
                                                    error={showError("date")}
                                                >
                                                    <input
                                                        id="date"
                                                        type="date"
                                                        min={today}
                                                        value={values.date}
                                                        onChange={set("date")}
                                                        aria-invalid={!!showError("date")}
                                                        aria-describedby={
                                                            showError("date") ? "date-error" : undefined
                                                        }
                                                        className={inputClass}
                                                    />
                                                </Field>

                                                <Field id="time" label="Preferred time" optional>
                                                    <SelectBox
                                                        id="time"
                                                        value={values.time}
                                                        onChange={set("time")}
                                                        options={times}
                                                    />
                                                </Field>
                                            </div>

                                            <div>
                                                <h4 className="font-display text-xl">Your brief</h4>
                                                <dl className="mt-3 divide-y divide-accent/50 rounded-2xl border border-accent/60 bg-background">
                                                    {summary.map(([label, value]) => (
                                                        <div
                                                            key={label}
                                                            className="grid gap-1 px-5 py-3.5 sm:grid-cols-[9rem_1fr] sm:gap-4"
                                                        >
                                                            <dt className="text-sm text-secondary/65">
                                                                {label}
                                                            </dt>
                                                            <dd className="whitespace-pre-line wrap-break-word text-[15px]">
                                                                {value}
                                                            </dd>
                                                        </div>
                                                    ))}
                                                </dl>
                                                <p className="mt-3 text-sm text-secondary/60">
                                                    Need to change something? Use Back. We only use your
                                                    details to respond to this request.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {serverError && (
                                        <p
                                            role="alert"
                                            className="mt-6 rounded-2xl bg-[#9B2C1F]/10 px-4 py-3 text-sm text-[#9B2C1F]"
                                        >
                                            {serverError}
                                        </p>
                                    )}

                                    <div
                                        className={`mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center ${step === 0 ? "sm:justify-end" : "sm:justify-between"
                                            }`}
                                    >
                                        {step > 0 && (
                                            <button
                                                type="button"
                                                onClick={goBack}
                                                className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-base font-medium text-primary transition hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                                            >
                                                <ArrowLeft size={18} aria-hidden="true" />
                                                Back
                                            </button>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-medium text-background shadow-[0_10px_24px_rgba(113,62,38,0.25)] transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-56"
                                        >
                                            {step < LAST
                                                ? "Continue"
                                                : loading
                                                    ? "Sending..."
                                                    : "Request my consultation"}
                                            <ArrowRight
                                                size={18}
                                                aria-hidden="true"
                                                className="transition motion-safe:group-hover:translate-x-1"
                                            />
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* 4. Closing quote */}
            <section className="bg-primary px-4 py-20 text-center text-background sm:px-8 sm:py-24">
                <span
                    aria-hidden="true"
                    className="mx-auto mb-8 block h-px w-16 bg-highlight"
                />
                <blockquote className="mx-auto max-w-3xl font-display text-3xl italic leading-snug sm:text-5xl">
                    “A home should feel like you, not like everyone else.”
                </blockquote>
            </section>
        </main>
    );
}