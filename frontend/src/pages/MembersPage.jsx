import MemberSection from "../components/MemberSection";
import InvitationSection from "../components/InvitationSection";

function MembersPage() {
    return (
        <div className="space-y-10">
            <InvitationSection />
            <MemberSection />
        </div>
    );
}

export default MembersPage;