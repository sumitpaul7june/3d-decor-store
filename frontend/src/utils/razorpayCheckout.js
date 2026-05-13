import axios from "../api/axios";

export const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const openRazorpayCheckout = async ({
  orderId,
  selectedAddress,
  authUser,
  contactEmail = "",
  onSuccess,
  onError,
  onLoadingChange,
}) => {
  let shouldStopLoading = true;

  try {
    onLoadingChange?.(true);

    const razorpayLoaded = await loadRazorpayScript();
    if (!razorpayLoaded) {
      throw new Error("Unable to load Razorpay checkout. Please try again.");
    }

    const { data: paymentData } = await axios.post("/payment/create-order", {
      orderId,
    });

    const razorpay = new window.Razorpay({
      key: paymentData.key,
      amount: paymentData.order.amount,
      currency: paymentData.order.currency,
      name: "QALARAHI",
      description: `Order #${orderId}`,
      order_id: paymentData.razorpayOrderId,
      handler: async (response) => {
        try {
          const { data } = await axios.post("/payment/verify", {
            appOrderId: orderId,
            ...response,
          });

          await onSuccess?.(data);
        } catch (error) {
          onError?.(
            error.response?.data?.message || "Payment verification failed"
          );
        } finally {
          onLoadingChange?.(false);
        }
      },
      prefill: {
        name: selectedAddress?.fullName || authUser?.name || "",
        email: contactEmail || authUser?.email || "",
        contact: selectedAddress?.phone || "",
      },
      notes: {
        address: selectedAddress
          ? `${selectedAddress.addressLine || ""}, ${selectedAddress.city || ""}, ${selectedAddress.state || ""} ${selectedAddress.pincode || ""}, ${selectedAddress.country || ""}`
          : "",
      },
      theme: {
        color: "#111111",
      },
      modal: {
        ondismiss: async () => {
          try {
            await axios.post("/payment/mark-failed", {
              appOrderId: orderId,
              razorpay_order_id: paymentData.razorpayOrderId,
              failureReason: "Checkout closed before payment completion",
              failureCode: "checkout_dismissed",
            });
          } catch (error) {
            // Ignore failure logging errors to avoid blocking the user flow.
          } finally {
            onLoadingChange?.(false);
          }
        },
      },
    });

    razorpay.on("payment.failed", async (response) => {
      try {
        await axios.post("/payment/mark-failed", {
          appOrderId: orderId,
          razorpay_order_id: response.error?.metadata?.order_id || paymentData.razorpayOrderId,
          paymentId: response.error?.metadata?.payment_id || "",
          failureReason: response.error?.description || "Payment failed",
          failureCode: response.error?.code || "",
        });
      } catch (error) {
        // Ignore failure logging errors to avoid blocking the user flow.
      } finally {
        onError?.(response.error?.description || "Payment failed");
        onLoadingChange?.(false);
      }
    });

    shouldStopLoading = false;
    razorpay.open();
    return true;
  } catch (error) {
    onError?.(
      error.response?.data?.message ||
        error.response?.data?.error?.description ||
        error.message ||
        "Failed to start payment"
    );
    return false;
  } finally {
    if (shouldStopLoading) {
      onLoadingChange?.(false);
    }
  }
};
