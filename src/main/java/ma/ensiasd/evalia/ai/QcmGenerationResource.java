package ma.ensiasd.evalia.ai;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.EntityPart;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.io.IOException;
import java.io.InputStream;

@Path("/ai")
public class QcmGenerationResource {

    @Inject QcmGenerationService service;

    @POST
    @Path("/generate")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public Response generate(@FormParam("file") EntityPart file,
                             @QueryParam("nb") @DefaultValue("5") int nb) throws IOException {
        if (file == null) {
            throw new BadRequestException("Champ 'file' manquant");
        }
        String name = file.getFileName()
          .orElseThrow(() -> new BadRequestException("Nom de fichier manquant"));
        try (InputStream in = file.getContent()) {
            return Response.ok(service.generate(name, in, nb)).build();
        }
    }
}