import React from 'react';
import { FaQuoteLeft } from 'react-icons/fa';

const ReviewCard = ({ review }) => {
    const { userName, review: testimonial, user_photoURL, issue_category } = review;

    return (
        <div className="max-w-sm mx-auto bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 mt-8">

            {/* Quote Icon */}
            <FaQuoteLeft className="text-amber-400 text-3xl mb-4" />

            {/* Optional: Issue Category Badge */}
            {issue_category && (
                <span className="inline-block bg-amber-100 text-amber-700 text-sm font-medium px-3 py-1 rounded-full mb-3">
                    {issue_category}
                </span>
            )}

            {/* Description */}
            <p className="mb-5 text-gray-700 leading-relaxed">
                {testimonial}
            </p>

            <div className="border-t border-gray-200 pt-4">
                {/* Profile Section */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-300 shadow-sm">
                        <img
                            className="w-full h-full object-cover"
                            src={user_photoURL}
                            alt={userName}
                        />
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                            {userName}
                        </h3>

                        {/* Optional subtitle */}
                        <p className="text-sm text-gray-500">
                            Verified Citizen Reporter
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ReviewCard;
