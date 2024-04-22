//code written by Anne-Lii Hansen VT 2024
"use strict"

document.addEventListener("DOMContentLoaded", () => {

    getData(); //get jobs from API

    //get element from HTML
    const jobList = document.getElementById("jobList");
    const addForm = document.getElementById("addForm");

    //async/await function
    async function getData() {

        const url = "https://backend-m3-api.onrender.com/jobs";

        const options = {
            method: 'GET'
        };

        try {
            const response = await fetch(url, options);//await response from fetch
            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`);
            }
            const result = await response.json();//konvert response to javascript      

            //sort enddate on jobs
            result.sort((a,b) => {
                if (a.enddate && b.enddate) {
                    return new Date (b.enddate) - new Date (a.enddate);
                } else if (a.enddate) {
                    return -1;
                } else if (b.enddate) {
                    return 1;
                }
                return 0;
                
            });

            if (jobList) {
                jobList.innerHTML = ""; //clear joblist
                result.forEach(job => {
                    const listItem = document.createElement("li");

                    // add ID based on job ID
                    listItem.id = `job-${job.id}`;

                    listItem.innerHTML = `
                        <h3>${job.jobtitle}</h3>
                        <p><strong>Företag:</strong> ${job.companyname}</p>
                        <p><strong>Ort:</strong> ${job.location}</p>
                        <p><strong>Startdatum:</strong> ${job.startdate ? job.startdate.split('T')[0] : "Ej angivet"}</p>
                        <p><strong>Slutdatum:</strong> ${job.enddate ? job.enddate.split("T")[0] : "Pågående"}</p>
                        <p><strong>Beskrivning:</strong> ${job.description}</p><br>
                        <button class="removeBtn" data-job-id="${job.id}">Ta bort jobb</button>
                        `;
                    jobList.appendChild(listItem);

                    //event for remove-button to remove specific job
                    const removeBtn = listItem.querySelector(".removeBtn");

                    if (removeBtn) {
                        removeBtn.addEventListener("click", function (event) {
                            const jobId = event.currentTarget.dataset.jobId;
                            //call function to remove job from database and send with JobId
                            removeJob(jobId);
                        });
                    }
                });
            }
        } catch (err) {
            console.error('Det uppstod ett fel:', err);
        }
    }

    //event when submiting form
    if (addForm) {
        addForm.addEventListener("submit", function (event) {
            event.preventDefault();

            console.log("klickat på submit");

            const formData = new FormData(addForm);

            //remove validation messages
            const errorElements = addForm.querySelectorAll(".error-message");
            errorElements.forEach(el => el.remove());

            // validate input from form
            const errors = validateForm(formData);
            if (Object.keys(errors).length > 0) {

                // show validation message
                Object.keys(errors).forEach(field => {
                    const input = addForm.querySelector(`[name=${field}]`);
                    const errorElement = document.createElement("div");
                    errorElement.classList.add("error-message");
                    errorElement.textContent = errors[field];

                    // add error message after input
                    input.parentNode.insertBefore(errorElement, input.nextSibling);

                    //remove validation message when writing in input
                    input.addEventListener("input", function () {
                        errorElement.remove();
                    });
                });
                return; // return if form is not valid
            }

            const jobData = {
                jobtitle: formData.get("jobtitle"),
                companyname: formData.get("companyname"),
                location: formData.get("location"),
                startdate: formData.get("startdate"),
                enddate: formData.get("enddate"),
                description: formData.get("description")
            };

            addJob(jobData);
        });
    }


    function validateForm(formData) {
        const errors = {};

        // validate all inputs
        if (!formData.get("companyname")) {
            errors.companyname = "Fyll i företagsnamn!";
        }

        if (!formData.get("location")) {
            errors.location = "Fyll i ort!";
        }

        if (!formData.get("jobtitle")) {
            errors.jobtitle = "Fyll i titel!";
        }

        if (!formData.get("description")) {
            errors.description = "Fyll i beskrivning!";
        }

        if (!formData.get("startdate")) {
            errors.startdate = "Fyll i startdatum!";
        }

        return errors;
    }

    //function to remove job
    async function removeJob(jobId) {
        const url = `https://backend-moment2-1-oqoy.onrender.com/api/work/${jobId}`;
        const options = {
            method: 'DELETE'
        };

        try {
            const response = await fetch(url, options);
            if (response.ok) {
                const listItem = document.getElementById(`job-${jobId}`);
                listItem.remove();
            }
        } catch (error) {
            console.error('Det uppstod ett fel:', error);
        }
    }

    //function to add job
    async function addJob(jobData) {
        const url = "https://backend-moment2-1-oqoy.onrender.com/api/work";
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jobData)
        };

        try {
            const response = await fetch(url, options);
            if (response.ok) {
                await response.json();

                // Återställ formuläret
                addForm.reset();

                //redirect to index.html
                window.location.href = "index.html";
            }
        } catch (error) {
            console.error("Det uppstod ett fel:", error);
        }
    }

});
