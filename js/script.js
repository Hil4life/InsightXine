
// ========================================
// INSIGHTXINE — MAIN JAVASCRIPT
// ========================================

"use strict";

// ========================================
// SAFE LOCAL STORAGE HELPERS
// ========================================

function getBusinessData() {
    try {
        return JSON.parse(
            localStorage.getItem("insightXineBusiness")
        );
    } catch (error) {
        console.error("Could not read business data:", error);
        return null;
    }
}

function getServices() {
    try {
        const services = JSON.parse(
            localStorage.getItem("insightXineServices")
        );

        return Array.isArray(services) ? services : [];
    } catch (error) {
        console.error("Could not read service data:", error);
        return [];
    }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function getRevenueLabel(value) {
    const labels = {
        "under-100k": "Under ₦100K",
        "100k-300k": "₦100K–₦300K",
        "300k-500k": "₦300K–₦500K",
        "500k-1m": "₦500K–₦1M",
        "1m+": "₦1M+"
    };

    return labels[value] || "--";
}

function getBusinessTypeLabel(value) {
    const types = {
        beauty: "Beauty & Salon",
        restaurant: "Restaurant",
        fashion: "Fashion",
        retail: "Retail",
        professional: "Professional",
        health: "Health & Wellness",
        other: "Other"
    };

    return types[value] || "--";
}

function getEmployeeLabel(value) {
    const labels = {
        "1": "Just me",
        "2-5": "2–5 people",
        "6-10": "6–10 people",
        "11-25": "11–25 people",
        "26+": "26+ people"
    };

    return labels[value] || "--";
}

function calculateEstimatedRevenue(services) {
    return services.reduce(function (total, service) {
        const bookings = Number(service.bookings) || 0;
        const price = Number(service.price) || 0;

        return total + bookings * price;
    }, 0);
}

function getTopService(services) {
    if (!services.length) {
        return null;
    }

    return services.reduce(function (top, service) {
        if (
            !top ||
            (Number(service.bookings) || 0) >
            (Number(top.bookings) || 0)
        ) {
            return service;
        }

        return top;
    }, null);
}

// ========================================
// LOW-PERFORMING SERVICES
// ========================================

function getLowPerformingServices(services) {
    if (!Array.isArray(services) || services.length < 2) {
        return [];
    }

    const highestBookings = Math.max(
        ...services.map(function (service) {
            return Number(service.bookings) || 0;
        })
    );

    if (highestBookings === 0) {
        return [];
    }

    return services.filter(function (service) {
        const bookings = Number(service.bookings) || 0;

        return bookings <= highestBookings / 2;
    });
}

function getLowPerformingService(services) {
    const lowServices = getLowPerformingServices(services);

    return lowServices.length ? lowServices[0] : null;
}

// ========================================
// BUSINESS SETUP FORM
// ========================================

const businessForm = document.getElementById("businessForm");

if (businessForm) {
    businessForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const businessData = {
            businessName: document.getElementById("businessName").value.trim(),
            businessType: document.getElementById("businessType").value,
            businessLocation: document.getElementById("businessLocation").value.trim(),
            employees: document.getElementById("employees").value,
            customers: Number(document.getElementById("customers").value) || 0,
            revenue: document.getElementById("revenue").value
        };

        localStorage.setItem(
         "insightXineBusiness",
         JSON.stringify(businessData)
        );

        window.location.href = "dashboard.html";
    });
}

// ========================================
// DISPLAY BUSINESS DETAILS
// ========================================

function displayBusinessDetails() {
    const businessData = getBusinessData();

    if (!businessData) {
        return;
    }

    const setText = function (id, value) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    };

    setText("dashboardBusinessName", businessData.businessName || "--");
    setText("profileBusinessName", businessData.businessName || "--");

    setText(
        "businessLocationDisplay",
        (businessData.businessLocation || "--") +
        " • " +
        getBusinessTypeLabel(businessData.businessType)
    );

    setText("profileLocation", businessData.businessLocation || "--");

    setText(
        "customerMetric",
        Number(businessData.customers) || 0
    );

    setText(
        "revenueMetric",
        getRevenueLabel(businessData.revenue)
    );

    setText(
        "businessTypeMetric",
        getBusinessTypeLabel(businessData.businessType)
    );

    setText(
        "profileBusinessType",
        getBusinessTypeLabel(businessData.businessType)
    );

    setText(
        "employeeMetric",
        getEmployeeLabel(businessData.employees)
    );

    setText(
        "profileEmployees",
        getEmployeeLabel(businessData.employees)
    );
}

// ========================================
// BUSINESS INSIGHT ENGINE
// ========================================

function generateBusinessInsight(businessData) {
    const customers = Number(businessData.customers) || 0;
    const businessType = businessData.businessType;
    const revenueRange = businessData.revenue;

    const services = getServices();
    const topService = getTopService(services);
    const estimatedRevenue = calculateEstimatedRevenue(services);

    let insight = "";
    let action = "";

    if (services.length > 0 && topService) {
        const totalBookings = services.reduce(function (total, service) {
            return total + (Number(service.bookings) || 0);
        }, 0);

        const topBookings = Number(topService.bookings) || 0;

        const percentage = totalBookings > 0
            ? Math.round((topBookings / totalBookings) * 100)
            : 0;

        insight =
            topService.name +
            " currently has the highest booking activity among your listed services, with " +
            topBookings +
            " bookings. It represents approximately " +
            percentage +
            "% of the bookings recorded across those services.";

        if (customers < 20) {
            insight +=
                " Attracting new customers could be an important growth opportunity.";
        } else if (customers < 50) {
            insight +=
                " Encouraging repeat purchases or visits could help strengthen customer retention.";
        } else {
            insight +=
                " Consider focusing on customer retention and delivering a consistent experience.";
        }

        if (businessType === "beauty") {
            action = "Create a package around " + topService.name +
                " and promote it to existing customers.";
        } else if (businessType === "restaurant") {
            action = "Create a combo featuring " + topService.name +
                " and promote it to repeat customers.";
        } else if (businessType === "fashion") {
            action = "Feature " + topService.name +
                " in your next promotion and consider pairing it with another popular item.";
        } else if (businessType === "retail") {
            action = "Create a bundle around " + topService.name +
                " to encourage additional purchases.";
        } else if (businessType === "professional") {
            action = "Promote " + topService.name +
                " and track whether your marketing increases bookings.";
        } else if (businessType === "health") {
            action = "Encourage repeat purchases of " + topService.name +
                " and track how many customers return.";
        } else {
            action = "Promote " + topService.name +
                " and monitor whether its booking activity grows.";
        }

        if (estimatedRevenue > 0) {
            if (estimatedRevenue < 100000) {
                action =
                    "Your listed services have an estimated revenue of ₦" +
                    estimatedRevenue.toLocaleString() +
                    ", based on the bookings and prices entered. Test a promotion for " +
                    topService.name +
                    " and track whether bookings increase.";
            } else {
                action =
                    "Your listed services have an estimated revenue of ₦" +
                    estimatedRevenue.toLocaleString() +
                    ", based on the bookings and prices entered. Focus on growing " +
                    topService.name +
                    " and encouraging repeat purchases.";
            }
        }
    } else {
        if (customers < 20) {
            insight = "Your business currently serves about " + customers +
                " customers per week. Attracting more first-time customers could be an important growth opportunity.";

            action = "Try a simple weekly promotion and encourage existing customers to refer someone new.";
        } else if (customers < 50) {
            insight = "Your business serves about " + customers +
                " customers per week. Encouraging repeat visits could help you get more value from your existing customer base.";

            action = "Introduce a simple repeat-customer offer and track how many customers return each week.";
        } else if (customers < 100) {
            insight = "Your business serves approximately " + customers +
                " customers per week. Improving retention and the value of each visit could support growth.";

            action = "Identify your most popular product or service and test a suitable bundle or package.";
        } else {
            insight = "Your business serves approximately " + customers +
                " customers per week. Maintaining service quality and improving efficiency could become important priorities.";

            action = "Track busy periods and customer feedback to identify opportunities to improve operations.";
        }
    }

    if (revenueRange === "under-100k") {
        insight +=
            " Your selected business revenue range suggests that growing customer reach and repeat purchases may be useful priorities.";
    } else if (revenueRange === "1m+") {
        insight +=
            " Given your selected revenue range, monitoring operating costs and customer retention may help support sustainable growth.";
    }

    const lowServices = getLowPerformingServices(services);

    if (lowServices.length > 0) {
        const names = lowServices.map(function (service) {
            return service.name;
        });

        insight +=
            " The following services have bookings at or below half the busiest service: " +
            names.join(", ") +
            ".";

        action =
            "Review and test targeted promotions for " +
            names.join(" and ") +
            ". Monitor their bookings to see whether the promotions help.";
    }

    return { insight: insight, action: action };
}

// ========================================
// DISPLAY BUSINESS INSIGHTS
// ========================================

function displayBusinessInsight() {
    const businessData = getBusinessData();

    if (!businessData) {
        return;
    }

    const result = generateBusinessInsight(businessData);

    const mainInsight = document.getElementById("mainInsight");

    if (mainInsight) {
        mainInsight.textContent = result.insight;
    }

    const actionCard = document.querySelector(".action-card");

    if (actionCard) {
        const title = actionCard.querySelector("h3");
        const paragraph = actionCard.querySelector("p:not(.dashboard-label)");

        if (title) {
            title.textContent = "Recommended next step";
        }

        if (paragraph) {
            paragraph.textContent = result.action;
        }
    }
}

// ========================================
// SERVICE FORM
// ========================================

const serviceForm = document.getElementById("serviceForm");
const servicesList = document.getElementById("servicesList");

if (serviceForm) {
    serviceForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const nameInput = document.getElementById("serviceName");
        const categoryInput = document.getElementById("serviceCategory");
        const bookingsInput = document.getElementById("bookings");
        const priceInput = document.getElementById("price");

        if (!nameInput || !categoryInput || !bookingsInput || !priceInput) {
            console.error("A service form field is missing from data.html.");
            return;
        }

        const name = nameInput.value.trim();

        if (!name) {
            alert("Please enter a service or product name.");
            return;
        }

        const service = {
            name: name,
            category: categoryInput.value,
            bookings: Number(bookingsInput.value) || 0,
            price: Number(priceInput.value) || 0
        };

        const services = getServices();
        services.push(service);

        localStorage.setItem(
        "insightXineServices",
        JSON.stringify(services)
       );

        serviceForm.reset();

        displayServices();
        updateTopService();
        updatePerformanceMetrics();
        displayBusinessInsight();
        displayPerformanceSummary();
        displayBusinessHealthScore();
    });
}

// ========================================
// DISPLAY SAVED SERVICES
// ========================================

function displayServices() {
    if (!servicesList) {
        return;
    }

    const services = getServices();

    if (services.length === 0) {
        servicesList.innerHTML =
            '<p class="empty-state">No services added yet.</p>';
        return;
    }

    servicesList.replaceChildren();

    services.forEach(function (service) {
        const item = document.createElement("div");
        item.className = "service-item";

        const info = document.createElement("div");
        info.className = "service-info";

        const title = document.createElement("h3");
        title.textContent = service.name;

        const category = document.createElement("p");
        category.textContent = service.category;

        info.appendChild(title);
        info.appendChild(category);

        const stats = document.createElement("div");
        stats.className = "service-stats";

        const bookingText = document.createElement("strong");
        bookingText.textContent =
            (Number(service.bookings) || 0) + " bookings";

        const priceText = document.createElement("span");
        priceText.textContent =
            "₦" + (Number(service.price) || 0).toLocaleString() +
            " average price";

        stats.appendChild(bookingText);
        stats.appendChild(priceText);

        item.appendChild(info);
        item.appendChild(stats);

        servicesList.appendChild(item);
    });
}

// ========================================
// TOP PERFORMING SERVICE
// ========================================

function updateTopService() {
    const services = getServices();
    const topService = getTopService(services);

    const nameElement = document.getElementById("topServiceName");
    const detailsElement = document.getElementById("topServiceDetails");

    if (!topService) {
        if (nameElement) {
            nameElement.textContent = "Add your services";
        }

        if (detailsElement) {
            detailsElement.textContent =
                "Add business activity to discover your strongest performer.";
        }

        return;
    }

    if (nameElement) {
        nameElement.textContent = topService.name;
    }

    if (detailsElement) {
        detailsElement.textContent =
            (Number(topService.bookings) || 0) +
            " bookings • ₦" +
            (Number(topService.price) || 0).toLocaleString() +
            " average price";
    }
}

// ========================================
// PERFORMANCE METRICS
// ========================================

function updatePerformanceMetrics() {
    const services = getServices();

    const setText = function (id, value) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    };

    setText("totalServicesMetric", services.length);

    const totalBookings = services.reduce(function (total, service) {
        return total + (Number(service.bookings) || 0);
    }, 0);

    setText("totalBookingsMetric", totalBookings);

    const revenue = calculateEstimatedRevenue(services);

    setText("estimatedRevenueMetric", "₦" + revenue.toLocaleString());

    const topService = getTopService(services);

    if (!topService) {
        setText("performanceTopService", "--");
        setText(
            "performanceTopServiceDetails",
            "Add services to see your top performer."
        );
        return;
    }

    setText("performanceTopService", topService.name);
    setText(
        "performanceTopServiceDetails",
        (Number(topService.bookings) || 0) + " bookings"
    );
}

// ========================================
// BUSINESS PERFORMANCE SUMMARY
// ========================================

function displayPerformanceSummary() {
    const services = getServices();

    const status = document.getElementById("performanceStatus");
    const message = document.getElementById("performanceMessage");
    const nextStep = document.getElementById("performanceNextStep");

    if (!status || !message || !nextStep) {
        return;
    }

    if (services.length === 0) {
        status.textContent = "Not enough data";
        message.textContent =
            "Add your services and booking numbers to begin tracking performance.";
        nextStep.textContent =
            "Add at least two services so InsightXine can compare their bookings.";
        return;
    }

    const totalBookings = services.reduce(function (total, service) {
        return total + (Number(service.bookings) || 0);
    }, 0);

    if (totalBookings === 0) {
        status.textContent = "Needs more activity";
        message.textContent =
            "No bookings have been recorded for your listed services yet.";
        nextStep.textContent =
            "Promote your services and record new bookings to start tracking progress.";
        return;
    }

    const lowServices = getLowPerformingServices(services);

    if (lowServices.length > 0) {
        status.textContent = "Some services need attention";
        message.replaceChildren();

        const summary = document.createElement("p");
        summary.textContent =
            "You have recorded " + totalBookings +
            " bookings. These services have bookings at or below half the busiest service:";

        const list = document.createElement("ul");

        lowServices.forEach(function (service) {
            const item = document.createElement("li");
            item.textContent =
                service.name + " — " +
                (Number(service.bookings) || 0) +
                " bookings";

            list.appendChild(item);
        });

        message.appendChild(summary);
        message.appendChild(list);

        const names = lowServices.map(function (service) {
            return service.name;
        });

        nextStep.textContent =
            "Test targeted promotions for " +
            names.join(" and ") +
            ". Track their bookings to see whether the promotions help.";
    } else {
        status.textContent = "Bookings recorded";
        message.textContent =
            "Your listed services have recorded " + totalBookings +
            " bookings. Keep tracking results to identify trends.";

        nextStep.textContent =
            "Continue monitoring bookings and compare performance over time.";
    }
}

// ========================================
// STEP 14 & 15 — BUSINESS HEALTH SCORE
// ========================================

function displayBusinessHealthScore() {
    const scoreElement = document.getElementById("healthScore");
    const statusElement = document.getElementById("healthStatus");
    const messageElement = document.getElementById("healthMessage");
    const scoreCircle = document.querySelector(".health-score-circle");

    if (!scoreElement || !statusElement || !messageElement) {
        return;
    }

    const services = getServices();

    // No service data yet

    if (services.length === 0) {
        scoreElement.textContent = "--";
        statusElement.textContent = "Not Enough Data";
        messageElement.textContent =
            "Add your services and booking details to assess your business health.";

        if (scoreCircle) {
            scoreCircle.style.backgroundColor = "#f1f5f9";
            scoreCircle.style.borderColor = "#94a3b8";
        }

        return;
    }

    const bookings = services.map(function (service) {
        return Number(service.bookings) || 0;
    });

    const totalBookings = bookings.reduce(function (total, count) {
        return total + count;
    }, 0);

    const lowServices = getLowPerformingServices(services);

    // Prototype scoring rules:
    // Zero bookings: 40-point deduction.
    // Each low-performing service: 15-point deduction.
    // This is a prototype indicator, not a validated business-health measure.

    let score = 100;

    if (totalBookings === 0) {
        score -= 40;
    }

    score -= lowServices.length * 15;

    score = Math.max(0, Math.min(100, score));

    // Display the score

    scoreElement.textContent = score;

    // Change the circle color and status based on the score

    if (score >= 80) {
        statusElement.textContent = "Good Performance";

        messageElement.textContent =
            "Your booking activity looks promising. Keep tracking your services and revenue.";

        if (scoreCircle) {
            scoreCircle.style.backgroundColor = "#e5f7f2";
            scoreCircle.style.borderColor = "#30bfa3";
        }
    } else if (score >= 60) {
        statusElement.textContent = "Moderate Performance";

        messageElement.textContent =
            "Some areas may need attention. Review service bookings and test improvements.";

        if (scoreCircle) {
            scoreCircle.style.backgroundColor = "#fff4d6";
            scoreCircle.style.borderColor = "#f0ad4e";
        }
    } else {
        statusElement.textContent = "Needs Attention";

        messageElement.textContent =
            "Several areas may need improvement. Review booking patterns and plan targeted promotions.";

        if (scoreCircle) {
            scoreCircle.style.backgroundColor = "#fde8e7";
            scoreCircle.style.borderColor = "#e05252";
        }
    }
}

// ========================================
// FINISH DATA ENTRY BUTTON
// ========================================

const finishDataButton = document.getElementById("finishDataButton");

if (finishDataButton) {
    finishDataButton.addEventListener("click", function () {
        window.location.href = "dashboard.html";
    });
}

// ========================================
// INITIALIZE THE CURRENT PAGE
// ========================================


function displayBookingChart() {
    const services = getServices();

    const chart = document.getElementById("bookingChart");
    const totalBookingsLabel = document.getElementById("chartTotalBookings");

    if (!chart || !totalBookingsLabel) {
        return;
    }

    const totalBookings = services.reduce(function (total, service) {
        return total + (Number(service.bookings) || 0);
    }, 0);

    totalBookingsLabel.textContent =
        totalBookings + (totalBookings === 1 ? " booking" : " bookings");

    if (services.length === 0) {
        chart.innerHTML = `
            <p class="chart-empty-message">
                Add your services to see your booking analytics.
            </p>
        `;
        return;
    }

    const highestBookings = Math.max(
        ...services.map(function (service) {
            return Number(service.bookings) || 0;
        })
    );

    chart.innerHTML = services.map(function (service) {
        const bookings = Number(service.bookings) || 0;

        const barWidth = highestBookings > 0
            ? (bookings / highestBookings) * 100
            : 0;

        return `
            <div class="chart-row">
                <div class="chart-label">
                    <span>${escapeChartText(service.name)}</span>
                    <strong>${bookings}</strong>
                </div>

                <div class="chart-bar-background">
                    <div
                        class="chart-bar"
                        style="width: ${barWidth}%"
                    ></div>
                </div>
            </div>
        `;
    }).join("");
}

function escapeChartText(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const replacements = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return replacements[character];
    });
}
displayBusinessDetails();
displayBusinessInsight();
displayServices();
updateTopService();
updatePerformanceMetrics();
displayPerformanceSummary();
displayBusinessHealthScore();
displayBusinessDetails();
displayBusinessInsight();
displayServices();
updateTopService();
updatePerformanceMetrics();
displayPerformanceSummary();
displayBusinessHealthScore();
displayBookingChart();


let deferredInstallPrompt = null;

const installAppButton = document.getElementById("installAppButton");

if (installAppButton) {
    window.addEventListener("beforeinstallprompt", function (event) {
        event.preventDefault();

        deferredInstallPrompt = event;
        installAppButton.hidden = false;
    });

    installAppButton.addEventListener("click", async function () {
        if (!deferredInstallPrompt) {
            alert(
                "To install InsightXine, open your browser menu and look for Install app or Add to Home Screen."
            );
            return;
        }

        deferredInstallPrompt.prompt();

        await deferredInstallPrompt.userChoice;

        deferredInstallPrompt = null;
        installAppButton.hidden = true;
    });

    window.addEventListener("appinstalled", function () {
        installAppButton.hidden = true;
        deferredInstallPrompt = null;
    });
}

