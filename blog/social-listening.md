# Social Listening

## Objective

Our goal with this project is we want to have the ablility identify when a social-media channel is mentioning a particular product. Allowing us to receive feedback on the product, or provide support to the customer for that product if needed.

## Note

For social listening to be truly complete, the system must be able to actively monitor many social-media channels in realtime. Even though we will have a close look at obtaining public data from one channel (Pantip), the proposed solution is meant to be used in bursts instead of actively monitoring this channel due some technical difficulty for this particular channel. Despite that the later stages of the system does not seem to have any issue with the realtime aspect of the social listening problem.

## High level overview

The main focus of this project is to create a machine learning model that can detect mentioning of products (in this case real estate and properties) since we are sponsored be *home.tech*.

The creation of almost any machine learning project can be split into 2 parts, data collection, model selection and tuning. Since our data is collected from the web and we will be using a supervised-learning approach. We will split the post into 3 major parts

1. [Raw-data collection from the web (web-crawling)](data-collection/data-collection.md)
2. [Data labeling](data-labeling/data-labeling.md)
3. Model selection and tuning
