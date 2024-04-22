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
            const result = await response.json();//convert response to javascript      

            //sort enddate on jobs
            result.sort((a,b) => {
                if (a.endDate && b.endDate) {
                    return new Date (b.endDate) - new Date (a.endDate);
                } else if (a.endDate) {
                    return -1;
                } else if (b.endDate) {
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
                        <p><strong>Startdatum:</strong> ${job.startDate ? job.startDate.split('T')[0] : "Ej angivet"}</p>
                        <p><strong>Slutdatum:</strong> ${job.endDate ? job.endDate.split("T")[0] : "Pågående"}</p>
                        <p><strong>Beskrivning:</strong> ${job.description}</p><br>
                        <button class="removeBtn" data-_id="${job._id}">Ta bort jobb</button>
                        `;
                    jobList.appendChild(listItem);

                    //event for remove-button to remove specific job
                    const removeBtn = listItem.querySelector(".removeBtn");

                    if (removeBtn) {
                        removeBtn.addEventListener("click", function (event) {
                            const jobId = event.target.dataset._id;

                           
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
                startDate: formData.get("startdate"),
                endDate: formData.get("enddate"),
                description: formData.get("description")
            };

            addJob(jobData);
        });
    }


    function validateForm(formData) {
        const errors = {};

        // validate all inputs and add warning when blank input
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
            errors.startDate = "Fyll i startdatum!";
        }

        return errors;
    }

    //function to remove job
    async function removeJob(jobId) {
        const url = `https://backend-m3-api.onrender.com/jobs/${jobId}`;
        const options = {
            method: 'DELETE'
        };
    
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                // Update the entire list after deleting job
                await getData();

                //showmessage job deleted and sett div height to 100px
                showMessage("Jobbet har tagits bort!");
            } else {
                console.error(`Failed to delete job with ID: ${jobId}`);
            }
        } catch (error) {
            console.error('Det uppstod ett fel:', error);
        }
    }

    //function to add job
    async function addJob(jobData) {

        const url = "https://backend-m3-api.onrender.com/jobs";
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

                // reset form
                addForm.reset();
                
                //relocate to index.html
                window.location.href = "index.html";
                
                //showmessage jobb added and sett div height to 100px
                showMessage("Jobbet har blivit tillagt!");
            }
        } catch (error) {
            console.error("Det uppstod ett fel:", error);
        }
    }

    //function to show added job and deleted job messages
    function showMessage(messageText) {

        const messageDiv = document.getElementById("message");

        if(messageDiv) {
            messageDiv.textContent = messageText;
            messageDiv.style.height= "100px";//set height to 100 px

            setTimeout(()=> {
                messageDiv.style.height = "0";
            }, 3000); //set height to 0 px after 3 sec
        }
    }

});
